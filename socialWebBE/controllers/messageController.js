const NodeCache = require('node-cache');
const cacheStorage = new NodeCache({ checkperiod: 120 });
const { verifyToken } = require('./authController');
const { db } = require('../models/realtimeDB.js');
const chalk = require('chalk');

const membersRef = db.ref('members');
const chatsRef = db.ref('chats');
const messagesRef = db.ref('messages');

module.exports = async (socket) => {
  const token = socket.handshake.query.token;
  if (!token) return;
  
  let userProfile = cacheStorage.get(token);
  if (!userProfile) {
    const userInfo = await verifyToken(token);
    if (!userInfo) return;
    cacheStorage.set(token, userInfo, 10000);
    userProfile = userInfo;
  }

  socket.emit('connected');

  // Lấy danh sách cuộc trò chuyện (cá nhân và nhóm)
  socket.on('getUserIdsMessaged', async () => {
    console.log('Fetching chat list');
    const chatInfo = [];
    const promises = [];

    try {
      const snapshot = await membersRef.orderByKey().once('value');
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const childData = childSnapshot.val();
          
          // Kiểm tra người dùng có trong conversation không
          if (childData[userProfile.user_id]) {
            const promise = chatsRef
              .child(childSnapshot.key)
              .once('value')
              .then((chatSnapshot) => {
                const chatData = chatSnapshot.val() || {};
                
                // Xử lý chat 1-1
                if (!chatData.is_group_chat) {
                  const recipientId = Object.keys(childData)
                    .find(key => key !== userProfile.user_id);
                  
                  chatInfo.push({
                    recipient_id: recipientId,
                    room_id: childSnapshot.key,
                    ...chatData
                  });
                } 
                // Xử lý chat nhóm
                else {
                  chatInfo.push({
                    group_id: childSnapshot.key,
                    ...chatData
                  });
                }
              });

            promises.push(promise);
          }
        });
      }

      // Chờ tất cả promises hoàn thành
      await Promise.all(promises);
      
      socket.emit('userIdsMessagedResponse', { chatInfo });
    } catch (error) {
      console.error(chalk.red('Error fetching chat list:'), error);
      socket.emit('chatListError', { 
        message: 'Failed to fetch chat list',
        error: error.toString()
      });
    }
  });

  // Lấy tin nhắn của một cuộc trò chuyện
  socket.on('getChatMessages', async (data) => {
    const { roomId, page = 1, limit = 50 } = data;
    
    if (!userProfile || !roomId) return;

    try {
      // Lắng nghe tin nhắn mới
      messagesRef
        .child(roomId)
        .limitToLast(1)
        .on('child_added', (snapshot) => {
          const newMessage = snapshot.val();
          
          // Chỉ gửi tin nhắn của người khác
          if (newMessage.user_id !== userProfile.user_id) {
            socket.emit('incoming-message', { newMessage });
          }
        });

      // Lấy danh sách tin nhắn
      const snapshot = await messagesRef
        .child(roomId)
        .limitToLast(page * limit)
        .once('value');

      socket.emit('chatMessagesResponse', { 
        allMessages: snapshot.val() || {}
      });
    } catch (error) {
      console.error(chalk.red('Error fetching messages:'), error);
      socket.emit('chatMessagesError', { 
        message: 'Failed to fetch messages',
        error: error.toString()
      });
    }
  });

  // Gửi tin nhắn (hỗ trợ cả chat 1-1 và nhóm)
  socket.on('newMessage', async (data) => {
    const { recipient_id, group_id, message, timestamp } = data;
    
    // Validate input
    if (!recipient_id && !group_id) {
      return socket.emit('messageError', { 
        message: 'Invalid message: No recipient or group specified' 
      });
    }

    const user_id = userProfile.user_id;

    try {
      let roomId = null;
      const isGroupChat = !!group_id;

      // Xử lý chat nhóm
      if (isGroupChat) {
        // Kiểm tra nhóm tồn tại
        const groupSnapshot = await membersRef.child(group_id).once('value');
        if (!groupSnapshot.exists()) {
          return socket.emit('messageError', { 
            message: 'Group does not exist' 
          });
        }

        // Kiểm tra người dùng có trong nhóm không
        const groupMembers = groupSnapshot.val();
        if (!groupMembers[user_id]) {
          return socket.emit('messageError', { 
            message: 'User not in this group' 
          });
        }

        roomId = group_id;
      } 
      // Xử lý chat 1-1
      else {
        // Tìm hoặc tạo room chat 1-1
        const snapshot = await membersRef.once('value');
        let existingRoom = null;

        snapshot.forEach((childSnapshot) => {
          const childData = childSnapshot.val();
          if (childData[user_id] && childData[recipient_id]) {
            existingRoom = childSnapshot.key;
            return true;
          }
        });

        // Nếu chưa có room, tạo mới
        if (!existingRoom) {
          const newChatRoomRef = membersRef.push();
          roomId = newChatRoomRef.key;
          
          await newChatRoomRef.update({
            [user_id]: true,
            [recipient_id]: true,
          });
          
          // Khởi tạo messages và chats
          await messagesRef.update({ [roomId]: {} });
          await chatsRef.update({ [roomId]: {} });
        } else {
          roomId = existingRoom;
        }
      }

      // Chuẩn bị dữ liệu tin nhắn
      const messageData = {
        user_id: user_id,
        message: message,
        timestamp: timestamp,
        ...(isGroupChat ? { 
          username: userProfile.username || userProfile.name 
        } : {})
      };

      // Lưu tin nhắn
      const newMessageRef = messagesRef.child(roomId).push();
      await newMessageRef.set(messageData);

      // Cập nhật thông tin chat
      const chatUpdateData = {
        last_message: message,
        sender_id: user_id,
        timestamp: timestamp,
        ...(isGroupChat ? { 
          is_group_chat: true,
          group_name: await getGroupName(group_id)
        } : { 
          is_group_chat: false 
        })
      };

      await chatsRef.child(roomId).update(chatUpdateData);

      // Trả về phản hồi
      socket.emit('messageSuccess', { 
        roomId: roomId, 
        isGroupChat: isGroupChat 
      });

    } catch (error) {
      console.error(chalk.red('Error sending message:'), error);
      socket.emit('messageError', { 
        message: 'Failed to send message',
        error: error.toString()
      });
    }
  });

  // Tạo nhóm mới
  socket.on('createGroup', async (data) => {
    const { group_name, member_ids } = data;
    const creator_id = userProfile.user_id;

    // Validate input
    if (!group_name || !member_ids || !Array.isArray(member_ids)) {
      return socket.emit('groupCreationError', { 
        message: 'Invalid group creation parameters' 
      });
    }

    try {
      // Tạo nhóm mới
      const newGroupRef = membersRef.push();
      const new_group_id = newGroupRef.key;

      // Chuẩn bị danh sách thành viên
      const groupMembers = {
        [creator_id]: {
          role: 'admin',
          joined_at: Date.now()
        }
      };

      // Thêm các thành viên khác
      member_ids.forEach(memberId => {
        if (memberId !== creator_id) {
          groupMembers[memberId] = {
            role: 'member',
            joined_at: Date.now()
          };
        }
      });

      // Lưu thành viên nhóm
      await newGroupRef.set(groupMembers);

      // Tạo thông tin chat cho nhóm
      const groupChatData = {
        group_name: group_name,
        creator_id: creator_id,
        created_at: Date.now(),
        last_message: 'Group created',
        timestamp: Date.now(),
        is_group_chat: true,
        members_count: Object.keys(groupMembers).length
      };

      await chatsRef.child(new_group_id).set(groupChatData);

      // Khởi tạo messages cho nhóm
      await messagesRef.child(new_group_id).push({
        system_message: true,
        message: `Group created by ${userProfile.username || creator_id}`,
        timestamp: Date.now(),
        user_id: creator_id
      });

      // Trả về thông tin nhóm mới
      socket.emit('groupCreated', { 
        group_id: new_group_id, 
        group_name: group_name,
        members: Object.keys(groupMembers)
      });

    } catch (error) {
      console.error(chalk.red('Error creating group:'), error);
      socket.emit('groupCreationError', { 
        message: 'Failed to create group',
        error: error.toString()
      });
    }
  });

  // Cập nhật thông tin nhóm
  socket.on('updateGroupInfo', async (data) => {
    const { group_id, group_name, add_members, remove_members } = data;
    const user_id = userProfile.user_id;

    try {
      // Kiểm tra quyền của người dùng
      const groupSnapshot = await membersRef.child(group_id).once('value');
      const groupMembers = groupSnapshot.val();

      // Kiểm tra quyền admin
      if (!groupMembers[user_id] || groupMembers[user_id].role !== 'admin') {
        return socket.emit('groupUpdateError', { 
          message: 'Insufficient permissions' 
        });
      }

      // Cập nhật tên nhóm
      if (group_name) {
        await chatsRef.child(group_id).update({ group_name });
      }

      // Thêm thành viên mới
      if (add_members && Array.isArray(add_members)) {
        add_members.forEach(memberId => {
          if (!groupMembers[memberId]) {
            groupMembers[memberId] = {
              role: 'member',
              joined_at: Date.now()
            };
          }
        });

        // Cập nhật số lượng thành viên
        await chatsRef.child(group_id).update({ 
          members_count: Object.keys(groupMembers).length 
        });

        // Lưu danh sách thành viên mới
        await membersRef.child(group_id).set(groupMembers);
      }

      // Xóa thành viên
      if (remove_members && Array.isArray(remove_members)) {
        remove_members.forEach(memberId => {
          if (groupMembers[memberId] && memberId !== user_id) {
            delete groupMembers[memberId];
          }
        });

        // Cập nhật số lượng thành viên
        await chatsRef.child(group_id).update({ 
          members_count: Object.keys(groupMembers).length 
        });

        // Lưu danh sách thành viên sau khi xóa
        await membersRef.child(group_id).set(groupMembers);
      }

      // Gửi phản hồi thành công
      socket.emit('groupUpdated', { 
        group_id, 
        group_name,
        members: Object.keys(groupMembers)
      });

    } catch (error) {
      console.error(chalk.red('Error updating group:'), error);
      socket.emit('groupUpdateError', { 
        message: 'Failed to update group',
        error: error.toString()
      });
    }
  });

  // Lấy danh sách nhóm của người dùng
  socket.on('getUserGroups', async () => {
    try {
      const userGroups = [];

      const snapshot = await membersRef.once('value');
      
      for (const [groupId, groupMembers] of Object.entries(snapshot.val() || {})) {
        // Kiểm tra xem người dùng có trong nhóm không
        if (groupMembers[userProfile.user_id]) {
          // Lấy thông tin chi tiết của nhóm
          const chatSnapshot = await chatsRef.child(groupId).once('value');
          const groupInfo = chatSnapshot.val();

          userGroups.push({
            group_id: groupId,
            ...groupInfo,
            user_role: groupMembers[userProfile.user_id].role
          });
        }
      }

      // Gửi danh sách nhóm về client
      socket.emit('userGroupsResponse', { groups: userGroups });

    } catch (error) {
      console.error(chalk.red('Error fetching user groups:'), error);
      socket.emit('userGroupsError', { 
        message: 'Failed to fetch groups',
        error: error.toString()
      });
    }
  });

  // Hàm hỗ trợ: Lấy tên nhóm
  async function getGroupName(group_id) {
    const snapshot = await chatsRef.child(group_id).once('value');
    return snapshot.val()?.group_name || 'Unnamed Group';
  }

  // Xử lý lỗi kết nối
  socket.on('connect_error', (err) => {
    console.log('Connect error', err.message);
    console.log(err.description);
    console.log(err.context);
  });

  // Xử lý ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
};