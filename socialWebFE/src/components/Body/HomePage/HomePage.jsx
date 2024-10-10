import "../../../App.scss";
import NavBar from "../../NavBar/NavBar";
import Header from "../../Header/Header";
import CreatePost from "../Post/CreatePost";
import Contacts from "../Contact/Contacts";
import Post from "../Post/Post";
import { useAuth } from "../../../AuthProvider";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import CreatePostModal from "../Modals/CreatePostModal";
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUser } from "../../../UserProvider";
import ChatBox from "../Message/ChatBox";

export default function HomePage() {
  //const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true); // [true, function
  const [chatBoxes, setChatBoxes] = useState([]);
  const [refresher, setRefresher] = useState(false);
  const page = useRef(1);

  const { token } = useAuth();
  const { user, handleGetProfile } = useUser();
  const homeMatch = useMatch("/");

  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;

  useEffect(handleGetProfile, []);
  const fetchPosts = () => {
    page.current += 1;
    axios
      .get(SERVER_DOMAIN + `/getPosts?page=${page.current}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.data.length === 0) {
          setHasMore(false);
          return;
        }
        console.log("fetch", res.data.data);
        setPosts([...posts, ...res.data.data]);
      })
      .catch((err) => {
        console.log(err);
        setHasMore(false);
      });
  };

  useEffect(() => {
    axios
      .get(SERVER_DOMAIN + "/getPosts?page=1&limit=5", {
      })
      .then((res) => {
        console.log("data", res.data.data);
        setIsLoading(false);
        setPosts(res.data.data);

      });
  }, [user, refresher]);

  return (
    <div className="App">
      <NavBar />
      <div className="main-ctn">
        <Header user={user?.user} />
        <div className="content flex">
          {homeMatch ? (
            <>
              <div className="newsfeed">
               {token &&  <CreatePost
                  setIsOpen={setIsOpen}
                  profilePicture={user?.user?.profile_picture}
                />}
                {!isLoading ? (
                  <InfiniteScroll
                    dataLength={posts?.length}
                    next={fetchPosts}
                    hasMore={hasMore}
                    loader={<Code className="post" />}
                    endMessage={
                      <p style={{ textAlign: "center", marginTop: "2rem" }}>
                        <b>Yay! You have seen it all</b>
                      </p>
                    }
                  >
                    {posts?.map((post) => (
                      <Post post={post} key={post.post_id} setRefresher={setRefresher}/>
                    ))}
                  </InfiniteScroll>
                ) : (
                  <>
                    <Code className="post" />
                    <Code className="post" />
                  </>
                )}
              </div>
              {token &&  <div className="contact">
                <Contacts
                  contacts={user?.contacts}
                  chatBoxes={chatBoxes}
                  setChatBoxes={setChatBoxes}
                />
              </div>}
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
      <CreatePostModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        user={user?.user}
        setRefresher={setRefresher}
      />
      <div className="chatbox-area">
        {chatBoxes
          .slice()
          .reverse()
          .map((cb, index) => (
            <ChatBox
              key={cb.chatBoxId}
              recipient_id={cb.recipient_id}
              chatBoxes={chatBoxes}
              setChatBoxes={setChatBoxes}
              index={index}
            />
          ))}
      </div>
    </div>
  );
}
