import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from "../../../AuthProvider";
import "../../../scss/UserManagement.scss"
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "../../Body/Post/Post";
import { useParams, useLocation } from 'react-router-dom';
import CreatePost from "../Post/CreatePost";
import CreatePostModal from "../Modals/CreatePostModal";
import { useUser } from "../../../UserProvider";
const ForumDetails = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresher, setRefresher] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [forum, setForum] = useState({})
  const location = useLocation();
  const isAdminView = location.pathname.includes('/admin');
  const { user, handleGetProfile } = useUser();
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const page = useRef(1);
  const { token } = useAuth();
  const { forum_id } = useParams();

  const fetchPosts = () => {
    page.current += 1;
    axios
      .get(`${SERVER_DOMAIN}/getPostForum/${forum_id}`, {
        params: {
          post_status: activeTab,
          limit: 5,
          page: page.current
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.data.length < 4) {
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
      .get(`${SERVER_DOMAIN}/getPostForum/${forum_id}`, {
        params: {
          post_status: activeTab,
          limit: 5,
          page: page.current
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("data", res.data.data);
        setIsLoading(false);
        setPosts(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setIsLoading(false);
      });
  }, [refresher, activeTab]);

  useEffect(() => {
    axios
      .get(`${SERVER_DOMAIN}/getForumById/${forum_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("data", res.data.data);
        setIsLoading(false);
        setForum(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setIsLoading(false);
      });
  }, [refresher]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPost = posts?.filter((post) =>
    (`${post.title} `).toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (forum.forum_status != "0" && !isAdminView) {
    return <h3 style={{ textAlign: 'center' }}>Forum is not accessible or does not exist.</h3>;
  }
  return (
    <div className="main-page">
      <div className="management">
        <h2>Forum: {forum?.forum_name}</h2>
        <p style={{ fontSize: "1.5em", marginBottom: "10px" }}>Description: {forum?.forum_description}</p>
        <p style={{ fontSize: "1em", marginBottom: "10px" }}>Number of posts: {forum?.post_count}</p>
        <div className="header_child flex a-center">
          <button className="arrange">
            <i className="fa-solid fa-arrow-up-z-a"></i>
          </button>
          <h3>Post list</h3>
          <form className="search search-user">
            <div className="input-group">
              <label htmlFor="search-user">
                <i className="fa-solid fa-magnifying-glass"></i>
              </label>
              <input
                id="search-user"
                type="text"
                placeholder="Search for post"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </form>
          <div className="line"></div>
        </div>
        {token && <CreatePost
          setIsOpen={setIsOpen}
          profilePicture={user?.user?.profile_picture}
        />}
        <div className="post-management">

          {!isLoading ? (
            <InfiniteScroll
              dataLength={filteredPost?.length || 0} // Đảm bảo `dataLength` luôn có giá trị
              next={fetchPosts}
              hasMore={hasMore && filteredPost?.length > 0} // Ngừng tải nếu không có bài viết
              loader={<Code className="post" />}
              endMessage={
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
              style={{
                maxHeight: '70vh', // Giới hạn chiều cao của InfiniteScroll
                overflowY: 'auto', // Cho phép cuộn dọc
              }}
            >
              {filteredPost?.length > 0 ? (
                filteredPost.map((post) => (
                  <Post post={post} key={post.post_id} setRefresher={setRefresher} />
                ))
              ) : (
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                  <b>No posts available or has been hidden</b>
                </p>
              )}
            </InfiniteScroll>

          ) : (
            <>
              <Code className="post" />
              <Code className="post" />
            </>
          )}
        </div>
      </div>
      <CreatePostModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        user={user?.user}
        setRefresher={setRefresher}
      />
    </div>
  );
};

export default ForumDetails;
