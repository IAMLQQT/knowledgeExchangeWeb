/* eslint-disable react/prop-types */
import InfiniteScroll from "react-infinite-scroll-component";
import "../scss/ChatBox.scss";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { io } from "socket.io-client";
import { useAuth } from "../AuthProvider";
import { useUser } from "../UserProvider";
import { useNavigate } from "react-router-dom";
import PopUpChat from "./PopUpChat";
function ChatBox({ recipient_id, chatBoxes, setChatBoxes, index }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chatBox, setChatBox] = useState({});
  const [recipientInfo, setRecipientInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { token } = useAuth();
  console.log(token);
  const { user } = useUser();
  const bottomRef = useRef();
  const prevLength = useRef(0);
  const page = useRef(1);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  const handleViewProfile = (userId) => {
    navigate("/profile/" + userId);
    setIsPopupOpen(false); // Đóng popup sau khi xem trang cá nhân
  };
  const openMessenger = () => {
    navigate("/messages" );
    setIsPopupOpen(false); // Đóng popup sau khi xem trang cá nhân
  };
  const fetchData = () => {
    page.current = ++page.current;
    console.log("page", page.current);
    socket.emit("getChatMessages", {
      token,
      roomId: chatBox.room_id,
      page: page.current,
      limit: 15,
    });
  };
  const handleSendMessage = () => {
    if (messageInput.trim() !== "") {
      const timestamp = Date.now();
      socket.emit("newMessage", {
        token,
        message: messageInput,
        recipient_id: recipient_id,
        timestamp: timestamp,
      });

      setChatMessages([
        ...chatMessages,
        {
          message: messageInput,
          user_id: user.user.user_id,
          timestamp: timestamp,
        },
      ]);
      setMessageInput("");
    }
  };
  useEffect(() => {
    // Create the WebSocket connection
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
      console.log(recipient_id);
      const roomInfo = chatInfo.filter(
        (chat) => chat.recipient_id === recipient_id
      );
      console.log("chatInfo", chatInfo);
      console.log("roomInfo", roomInfo);
      if (roomInfo.length === 0) {
        setHasMore(false);
      }
      setChatBox(roomInfo[0]);
      axios
        .get(`${SERVER_DOMAIN}/user/getInfoList?user_ids=${recipient_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res.data.data);
          setRecipientInfo(...res.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    });

    setSocket(newSocket);
  }, []);
  useEffect(() => {
    if (!socket || !chatBox) return;
    socket.emit("getChatMessages", {
      token,
      roomId: chatBox.room_id,
      page: 1,
      limit: 20,
    });

    const chatMessagesResponseHandler = (data) => {
      const { allMessages } = data;
      const allMess = Object.values(allMessages);

      console.log("length", allMess.length, prevLength.current);
      if (allMess.length == prevLength.current) {
        setHasMore(false);
      } else {
        setChatMessages(allMess);
      }
      console.log("mess", allMess);
    };
    socket.on("chatMessagesResponse", chatMessagesResponseHandler);
    return () =>
      socket.off("chatMessagesResponse", chatMessagesResponseHandler);
  }, [socket, chatBox]);

  useEffect(() => {
    if (connected && socket) {
      socket.emit("getUserIdsMessaged");
    }
  }, [connected, socket]);
  useEffect(() => {
    if (!socket) return;
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
    prevLength.current = chatMessages.length;
    return () => socket.off("incoming-message", handleReceiveMessage);
  }, [chatMessages]);
  useEffect(() => {
    console.log(socket, connected, recipientInfo?.user_id );
    if (socket && connected && recipientInfo?.user_id) {
      setIsLoading(false);
    }
  }, [socket, connected, recipientInfo]);
  if (isLoading)
    return (
      <div
        className="loading-ctn"
        style={{ height: "450px", width: "338px", backgroundColor: "white" }}
      >
        <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#c9c9c9"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{ alignSelf: "center", justifyContent: "center" }}
          wrapperClass="loading"
        />
      </div>
    );

  return (
    <div
      className="chatbox-ctn"
      style={{
        display: index == 0 || index == chatBoxes.length - 1 ? "block" : "none",
      }}
    >
      {!isLoading && (
        <>
          <div className="chatbox-header">
            <div
              className="user-info"
              onClick={() => setIsPopupOpen((prev) => !prev)}
            >
              <img
                crossOrigin="anonymous"
                src={recipientInfo.profile_picture}
                alt="use-ava"
                onError={(e) => {
                  e.target.src = "/public/user.png";
                }}
              />
              <p>
                {recipientInfo.first_name} {recipientInfo.last_name}
                <i class="fa-solid fa-chevron-down"></i>
              </p>
            </div>
            <div className="icons">
              <button
                type="button"
                onClick={() => setIsMinimized((pre) => !pre)}
              >
                <img src="/dash-solid.png" alt="Minimize Icon" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const newChatBoxs = chatBoxes.filter(
                    (chat) => chat.recipient_id !== recipient_id
                  );
                  setChatBoxes(newChatBoxs);
                }}
              >
                <img src="/close-solid.png" alt="Close Icon" />
              </button>
            </div>
            {isPopupOpen && (
              <PopUpChat
                onViewProfile={handleViewProfile}
                recipientId={recipientInfo.user_id}
                openMessenger={openMessenger}
              />
      )}
          </div>
          {!isMinimized && (
            <>
              <div
                className="message-ctn"
                id={"scrollableDiv"}
                //style={{ display: isMinimized && "none" }}
              >
                <InfiniteScroll
                  dataLength={chatMessages.length} //This is important field to render the next data
                  next={fetchData} // Use throttled function
                  hasMore={hasMore}
                  loader={
                    <TailSpin
                      visible={true}
                      height="30"
                      width="30"
                      color={"#4361ee"}
                      ariaLabel="tail-spin-loading"
                      radius="1"
                      wrapperStyle={{ alignSelf: "center" }}
                      wrapperClass=""
                    />
                  }
                  // endMessage={
                  //   <p style={{ textAlign: "center" }}>
                  //     <b>Yay! You have seen it all</b>
                  //   </p>
                  // }
                  style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
                  inverse={true} //
                  scrollableTarget="scrollableDiv" // Specify the target scrollable container
                >
                  {chatMessages
                    .slice()
                    .reverse()
                    .map((mess, index) => (
                      <p
                        className={`chat-message ${
                          mess?.user_id === user?.user?.user_id
                            ? "user-message"
                            : "incoming-message"
                        }`}
                        key={index}
                      >
                        {mess.message}
                      </p>
                    ))}
                </InfiniteScroll>

                <div ref={bottomRef}></div>
              </div>
              <div
                className="input-ctn"
                style={{ display: isMinimized && "none" }}
              >
                <input
                  type="text"
                  name="message"
                  id="message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <img
                  src="/comment-icon.png"
                  alt="send-icon"
                  onClick={handleSendMessage}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ChatBox;