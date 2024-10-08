import ChatHeader from "../ui/ChatHeader";
import "../scss/Message.scss";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../AuthProvider";
import axios from "axios";
import { useUser } from "../UserProvider";
import InfiniteScroll from "react-infinite-scroll-component";
import { Blocks, TailSpin } from "react-loader-spinner";
import moment from "moment";
import Linkify from 'react-linkify';
import { Navigate, useNavigate } from "react-router-dom";

function Message() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuth();
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);
  console.log("user",);

  const bottomRef = useRef();
  const prevLength = useRef(0);
  const page = useRef(1);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  const iconMap = {
    ":v": "😀",
    ":thumbsup:": "👍",
    ":heart:": "❤️",
    ":V": "😇",
    ":)": "😊",
    ":P": "😜",
    ":D": "😃",
    ":(": "😞",
    ":O": "😮",
    ":|": "😐",
    ":*": "😘",
    ":$": "🤑",
    ":X": "🤐",
    ":/": "😕",
    ";)": "😉",
    ":@": "😡",
    ":S": "😨",
    ":&": "🤔",
    ":#": "🤫",
    ":*(": "😥",
    // Add more mappings as needed
  };

  function formatTimestamp(timestamp) {
    const currentDate = new Date();
    const inputDate = new Date(timestamp); // Convert Unix timestamp to milliseconds
    console.log(
      currentDate.toDateString(),
      inputDate.toDateString(),
      currentDate.toDateString() == inputDate.toDateString()
    );
    if (currentDate.toDateString() == inputDate.toDateString()) {
      return moment.unix(timestamp / 1000).format("HH:mm");
    }
    return moment.unix(timestamp / 1000).format("LLL");
  }
  const fetchData = () => {
    page.current = ++page.current;
    console.log("page", page.current);
    socket.emit("getChatMessages", {
      token,
      roomId: selectedRoom,
      page: page.current,
      limit: 15,
    });
  };

  const handleSendMessage = (e) => {
    if (
      e.keyCode === 13 &&
      messageInput.trim() !== "" &&
      selectedRoom &&
      selectedReceiverId
    ) {
      const timestamp = Date.now();
      let updatedMessage = messageInput.trim();
      // Iterate over the icon map and replace text inputs with icons
      Object.entries(iconMap).forEach(([text, icon]) => {
        // Escape special characters in the text
        const escapedText = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        updatedMessage = updatedMessage.replace(
          new RegExp(`(^|\\s)${escapedText}(?=\\s|$)`, "g"),
          `$1${icon}`
        );
      });
      // Do something with the updated message (e.g., send it to the server)
      console.log(updatedMessage);
      socket.emit("newMessage", {
        token,
        message: updatedMessage,
        recipient_id: selectedReceiverId,
        timestamp: timestamp,
      });

      setChatMessages([
        ...chatMessages,
        {
          message: updatedMessage,
          user_id: user.user.user_id,
          timestamp: timestamp,
        },
      ]);
      setMessageInput("");
    }
  };

  useEffect(() => {
    // Create the WebSocket connection

    if (!token) {
      navigate("/login");
      return;
    }
    prevLength.current = 0;
    page.current = 1;
    const newSocket = io(SERVER_DOMAIN, {
      transports: ["websocket"],
      query: {
        token: token,
      },
    });
    setSocket(newSocket); // Update socket state

    newSocket.on("connected", () => {
      setConnected(true); // Update connected state on successful connection
      console.log("connected to server");
    });
    newSocket.on("userIdsMessagedResponse", (data) => {
      const { chatInfo } = data;
      const userIdsMessaged = chatInfo.map((chat) => chat.recipient_id);
      if (userIdsMessaged.length === 0) {
        setChatInfo([]);
        setIsLoading(false);
        return;
      }
      setChatInfo(chatInfo);
      console.log(chatInfo);
      axios
        .get(
          `${SERVER_DOMAIN}/user/getInfoList?user_ids=${userIdsMessaged.join(
            ","
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setRecipientInfo(res.data.data);
          console.log(res.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    });

    setSocket(newSocket);
  }, [selectedRoom]);
  useEffect(() => {
    if (connected && socket) {
      socket.emit("getUserIdsMessaged");
    }
  }, [connected, socket]);
  useEffect(() => {
    if (!selectedRoom && !connected) return;
    socket.emit("getChatMessages", {
      token,
      roomId: selectedRoom,
      page: 1,
      limit: 12,
    });

    const chatMessagesResponseHandler = (data) => {
      const { allMessages } = data;
      if (allMessages == null) {
        setHasMore(false);
        setChatMessages([]);
        return;
      }
      const allMess = Object.values(allMessages);

      console.log("length123", allMess.length, prevLength.current);
      if (allMess.length == prevLength.current) {
        setHasMore(false);
        setChatMessages(allMess);
      } else {
        setChatMessages(allMess);
      }
      console.log("mess", allMess);
    };
    socket.on("chatMessagesResponse", chatMessagesResponseHandler);
    return () =>
      socket.off("chatMessagesResponse", chatMessagesResponseHandler);
  }, [socket, connected, token, selectedRoom]);

  useEffect(() => {
    if (!socket) return;

    // prevLength.current = chatMessages.length;
    console.log("length pre", prevLength.current);
    const handleReceiveMessage = (data) => {
      const newMessage = data.newMessage;
      // this is null
      setChatMessages([...chatMessages, newMessage]);
      const senderInfo = recipientInfo.find(
        (user) => user.user_id === newMessage.user_id
      );

      if (document.visibilityState !== "visible") {
        if (Notification.permission !== "granted") {
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              // Permission granted, you can now show notifications

              // Hiển thị thông báo nếu không đang trên tab và quyền hiển thị thông báo đã được cấp

              new Notification(
                `${senderInfo.first_name} ${senderInfo.last_name}`,
                {
                  body: newMessage.message,
                  icon: senderInfo?.profile_picture, // Đường dẫn đến biểu tượng thông báo
                }
              );
            }
          });
        } else {
          new Notification(`${senderInfo.first_name} ${senderInfo.last_name}`, {
            body: newMessage.message,
            icon: senderInfo?.profile_picture, // Đường dẫn đến biểu tượng thông báo
          });
        }
      }
    };
    socket.on("incoming-message", handleReceiveMessage);
    //bottomRef.current.scrollIntoView({});

    return () => socket.off("incoming-message", handleReceiveMessage);
  }, [socket, recipientInfo, chatMessages]);
  useEffect(() => {
    console.log(recipientInfo, chatInfo);
    if (user && connected && socket && recipientInfo) {
      setIsLoading(false);
      return;
    }
  }, [user, connected, socket, recipientInfo]);
  if (isLoading)
    return (
      <Blocks
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="blocks-loading"
        wrapperStyle={{ textAlign: "center" }}
        wrapperClass="blocks-wrapper"
        visible={true}
      />
    );
  return (
    <div className="chat-page">
      <ChatHeader />
      <div className="chat-ctn">
        <div className="chat-list">
          <h2>Chat list</h2>
          {recipientInfo?.map((chat) => (
            <div
              className={`message-info ${chat.user_id === selectedReceiverId && "selected"
                }`}
              key={chat.user_id}
              onClick={() => {
                const roomId = chatInfo.find(
                  (ch) => ch.recipient_id === chat.user_id
                )?.room_id;
                setSelectedReceiverId(chat.user_id);
                setSelectedRoom(roomId);
                setSelectedUser(chat);
              }}
            >
              <img
                src={chat.profile_picture}
                alt="User Avatar"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.src = "/public/user.png";
                }}
              />
              <div className="info">
                <h4>
                  {chat.first_name} {chat.last_name}
                </h4>
                {/* <p>
                  {chatInfo.find((cv) => cv.sender_id === chat.user_id)
                    ? ""
                    : "You: "}
                  {
                    chatInfo.find((cv) => cv.recipient_id === chat.user_id)
                      .last_message
                  }
                </p> */}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-box">
          <div className="message-ctn" id={"scrollableDiv"}>
            {!selectedRoom && (
              <p className="selection-noti">Select your contact to chat!</p>
            )}
            {selectedRoom && (
          <InfiniteScroll
          dataLength={chatMessages.length}
          next={fetchData}
          hasMore={hasMore}
          loader={
            <TailSpin
              visible={true}
              height="80"
              width="80"
              color="#c9c9c9"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{ alignSelf: "center" }}
              wrapperClass=""
            />
          }
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
          style={{ display: "flex", flexDirection: "column-reverse" }}
          inverse={true}
          scrollableTarget="scrollableDiv"
        >
          {chatMessages
            .slice()
            .reverse()
            .map((mess, index) => {
              const isUserMessage = mess?.user_id === user?.user?.user_id;
              return (
                <Linkify key={index}>
                  <p
                    className={`chat-message ${isUserMessage ? "user-message" : "incoming-message"}`}
                  >
                    {mess.message}
                  </p>
                </Linkify>
              );
            })}
        </InfiniteScroll>
        
            )}
            <div ref={bottomRef}></div>
          </div>
          <div className="input-ctn">
            <input
              type="text"
              name="message"
              id="message-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleSendMessage}
            />
            <img src="/comment-icon.png" alt="send-icon" />
          </div>
        </div>
        <div className="chat-user-info">
          {selectedUser ? (
            <div className="info flex a-center j-center">
              <img src={selectedUser.profile_picture} alt="User Profile" />
              <h4>{selectedUser.first_name} {selectedUser.last_name}</h4>
              <button
                onClick={() => navigate(`/profile/${selectedUser.user_id}`)} // Điều hướng tới trang cá nhân của người dùng
                className="profile-btn flex a-center j-center"
              >
                <i class="fa-solid fa-user-tie"></i>
                View Profile
              </button>
              <div className="storage-share">
                <button className="files flex a-cente">
                  Files
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
                <button className="link flex a-center">
                  Link
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
              </div>
              <button className="delete-chat">
                Detele Chat
              </button>
            </div>

          ) : (
            <p>Click on a user to see their details</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default Message;