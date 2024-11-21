import moment from "moment";
import "../../../scss/SavedPosts.scss";
import { useUser } from "../../../UserProvider";
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function SavedPost() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useUser();
  const created_at = user?.user?.created_at;
  const { token } = useAuth();
  const navigate = useNavigate();
  let date = new Date(created_at);
  let date_string = moment(date).format("LLL");
  const page = useRef(1);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const handleUnsavePost = (post_id) => {
    setPosts(posts.filter((post) => post.post_id !== post_id));
    axios
      .delete(`${SERVER_DOMAIN}/unsavePost`, {
        data: {
          post_id: post_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong! Please try later!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };
  const fetchPosts = () => {
    page.current += 1;
    axios
      .get(SERVER_DOMAIN + `/getSavedPosts?page=${page.current}&limit=5`, {
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
    if (!token) navigate("/login")
    setIsLoading(true);
    axios
      .get(SERVER_DOMAIN + `/getSavedPosts?page=1&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("data", res.data.data);
        setIsLoading(false);
        setPosts(res.data.data);
      });
  }, []);
  return (
    <div className="saved-post">
      <div className="saved-post-header">
        <div className="profile-info">
          <img
            src={user?.user?.profile_picture}
            alt=""
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = "/public/user.png";
            }}
          />
          <div className="">
            <div className="name">{`${user?.user?.first_name} ${user?.user?.last_name}`}</div>
            <p>{`Member since ${date_string}`}</p>
          </div>
        </div>
        <div className="header-button">
          <button onClick={() => navigate("/profiledetail")}>
            Edit Profile
          </button>
          <button
            onClick={() => navigate("/profile/" + user?.user.user_id)}
          >
            Network Profile
          </button>
        </div>
      </div>

      <div className="saved-post-body">
        <h1>Saved Post</h1>
        {!isLoading ? (
          posts.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "2rem" }}>
              <b>You have not saved any posts</b>
            </p>
          ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchPosts}
            hasMore={hasMore}
            loader={<Code className="post" />}
            endMessage={
              <p style={{ textAlign: "center", marginTop: "2rem" }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {posts?.map((bookmark) => (
              <Post
                post={
                  { 
                    post_id: bookmark.post.post_id,
                    title: bookmark.post.title,
                    tagsString: bookmark.post.tag_id_tags.map(tag => tag.tag_name).join(', '),
                    user: bookmark.post.user,
                    created_at: bookmark.post.created_at,
                    likeCount: bookmark.post.likes.length,
                    commentCount: bookmark.post.commentPost.length
                  }
                }
                key={bookmark.post_id}
                isSavedPost={true}
                handleUnsavePost={handleUnsavePost}
              />
            ))}
          </InfiniteScroll>
          )
        ) : (
          <>
            <Code className="post" />
            <Code className="post" />
          </>
        )}
      </div>
    </div>
  );
}

export default SavedPost;