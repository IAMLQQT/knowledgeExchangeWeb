const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const { user, account, friendship, friendrequest } = require('../models/models');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs');
const { Op, Sequelize, where } = require('sequelize');
const { sequelize } = require('../models/models');
const { nanoid } = require('nanoid');
exports.acceptFriendrequest = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { user_sent_id, created_at } = req.body;
    await friendrequest.update(
      { request_status: 1 },
      {
          where: {
              user_receive_id: user_id,
              user_sent_id,
              request_status: 0,
          },
      }
   );
    const successAccept = await friendship.create({
        friendship_id: nanoid(35),
        user_id: user_id,
        user_friend_id: user_sent_id,
        created_at
    });
    res.status(200).json({ message: 'success', data: successAccept});
  });
  exports.unFriends = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { user_friend_id } = req.body;
    try {
        // Xóa bản ghi friendship giữa user_id và user_friend_id
        await friendship.destroy({
            where: {
                [Op.or]: [
                    { user_id: user_id, user_friend_id: user_friend_id },
                    { user_id: user_friend_id, user_friend_id: user_id }
                ]
            }
        });

        // Xóa các yêu cầu kết bạn giữa hai người (nếu có)
        await friendrequest.destroy({
            where: {
                [Op.or]: [
                    { user_sent_id: user_id, user_receive_id: user_friend_id },
                    { user_sent_id: user_friend_id, user_receive_id: user_id }
                ]
            }
        });

        res.status(200).json({ message: 'Unfriend and related requests removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while removing friendship and friend requests'
        });
    }
});


exports.addFriendRequest = catchAsync(async(req, res, next) => {
  const { user_id } = req.user;
  const { user_receive_id, created_at } = req.body;
  try {
    // Kiểm tra nếu yêu cầu kết bạn đã tồn tại
    const existingRequest = await friendrequest.findOne({
      where: {
        user_sent_id: user_id,
        user_receive_id: user_receive_id  ,
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        status: 'fail',
        message: 'Friend request already sent',
      });
    }

    // Tạo yêu cầu kết bạn mới
    const newFriendRequest = await friendrequest.create({
      user_sent_id: user_id,
      user_receive_id: user_receive_id,
      created_at
    });

    res.status(201).json({
      status: 'success',
      data: {
        friendrequest: newFriendRequest,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while sending the friend request',
    });
  }
})

exports.getFriendRequest = catchAsync(async(req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const user_receive_id = req.user.user_id;
  try {
    if (!user_receive_id) {
      return res.status(400).json({
        status: 'fail',
        message: 'user_receive_id is required',
      });
    }
    const friendRequests = await friendrequest.findAll({
      limit,
      offset,
      where: {
        user_receive_id: user_receive_id, 
      },
      include: [
        {
          model: user,
          as: 'user_sent',
          attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
        },
      ],
    });
    const pendingRequestsCount = await friendrequest.count({
      where: {
        user_receive_id: user_receive_id,
        request_status: 0, // 0 là trạng thái chưa chấp nhận
      },
    });
    const friendRequestWithCount = friendRequests.map((friendrequest) => {
      return {
        ...friendrequest.toJSON(),
        count: pendingRequestsCount,
        isAccepted: friendrequest.request_status === true
      }
      
    })
    res.status(200).json({
      status: 'success',
      data: friendRequestWithCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching friend requests',
    });
  }
})

exports.declideFriendRequest = catchAsync(async (req, res, next) => {
  const  user_receive_id  = req.user.user_id;
  const { request_id } = req.body;
   const result = await friendrequest.destroy({
    where: {
      request_id: request_id,
      user_receive_id: user_receive_id,
      request_status: 0,
    },
  });
  if (result === 0) {
    return res.status(404).json({
        status: 'fail',
        message: 'Friend request not found or already processed',
    });
}
  res.status(200).json({ message: 'success' });
});