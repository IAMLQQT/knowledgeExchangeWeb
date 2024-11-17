import { Code } from "react-content-loader";
import { useUser } from "../../../UserProvider";
import "../../../scss/Profile.scss";

import CreatePost from "../Post/CreatePost";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "../Post/Post";
import { useAuth } from "../../../AuthProvider";
import CreatePostModal from "../Modals/CreatePostModal";
import { toast } from "react-toastify";
import moment from "moment";
export default function Profile() {
  const { user, handleGetProfile } = useUser();
  const { token, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refresher, setRefresher] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const page = useRef(1);
  const [userProfile, setUserProfile] = useState(null);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { userId } = useParams();
  const handleButtonClick = () => {
    setShowDropdown(!showDropdown);
  };
  const handleUnfriendClick = () => {
    setShowModal(true);
};
const handleCancelUnfriend = () => {
  setShowModal(false);
};
  const navigate = useNavigate();
  const handleAddFriend = () => {
    axios
      .post(
        SERVER_DOMAIN + "/user/addfriendrequest",
        {
          user_receive_id: userId,
          created_at: moment().unix(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setUserProfile({
          ...userProfile,
          isRequestFriend: true,
        });
        handleGetProfile();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };
  const handleConfirmUnfriend = () => {
    axios
        .post(
            SERVER_DOMAIN + "/user/unfriend",
            {
                user_friend_id: userProfile.user_id,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((res) => {
            console.log("Unfriended successfully:", res.data);
            setShowModal(false);
            setShowDropdown(false);
            setRefresher(!refresher)
        })
        .catch((err) => {
            console.error("Error unfriending:", err);
        });
};
  useEffect(() => {
    const apiEndpoint = userId
      ? `${SERVER_DOMAIN}/user/getUserSearchProfile/${userId}`
      : `${SERVER_DOMAIN}/user/getProfile/`;
    axios
      .get(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("profile", res.data);
        setUserProfile(res.data.data.user);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 401) {
          toast.error("Please login to continue!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
          localStorage.removeItem("token");
          setToken(null);
          navigate("/");
          return;
        }
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  }, [userId, refresher]);
  useEffect(() => {
    axios
      .get(SERVER_DOMAIN + `/getPosts?page=1&limit=5&userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("data", res.data.data);
        setIsLoading(false);
        setPosts(res.data.data);

      });
  }, [userProfile, refresher]);
  const fetchPosts = () => {
    page.current += 1;
    axios
      .get(
        SERVER_DOMAIN +
        `/getPosts?page=${page.current}&limit=5&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.data.length === 0) {
          setHasMore(false);
          return;
        }
        setHasMore(true);
        console.log("fetch", res.data.data);
        setPosts([...posts, ...res.data.data]);
      })
      .catch((err) => {
        console.log(err);
        setHasMore(false);
      });
  };
  if (!user || !userProfile) return <Code />;
  return (
    <div className="profile">
      <div className="profile-header flex a-center">
        <div className="flex a-center">
          <div className="avatar-user">
            <img
              crossOrigin="anonymous"
              src={userProfile.profile_picture}
              alt="User profile"
            />
          </div>
          <div className="profile-information ">
            <div className="profile-name flex a-center">
              <h3 className="first-name">{userProfile.first_name}</h3>
              <h3 className="last-name">{userProfile.last_name}</h3>
             
            </div>
            <h5 className="followers">{userProfile.friendships} Friends</h5>
          </div>
        </div>
        <div className="follow-button">
          {userProfile.user_id !== user?.user?.user_id && (
            userProfile.isFriendShip ? (
              <div className="friend-button-container" style={{ position: 'relative' }}>
                <button className="friends flex a-center" onClick={handleButtonClick}>
                  Friends
                  <img src="/check.png" alt="Friends" />
                </button>
                {showDropdown && (
                  <div className="dropdown-menu" style={{ position: 'absolute', top: '110%', right : '0', background: '#fff', zIndex: 1000 }}>
                   <button className="unfriend-button" onClick={handleUnfriendClick}>
                      Unfriend
                    </button>
                  </div>
                )}
                {showModal && (
                <>
                    <div className="modal-backdrop" />
                    <div className="modal">
                        <p>Are you sure you want to unfriend {userProfile.first_name} {userProfile.last_name}?</p>
                        <button onClick={handleConfirmUnfriend}>Yes</button>
                        <button onClick={handleCancelUnfriend}>No</button>
                    </div>
                </>
            )}
              </div>
            ) : userProfile.isRequestFriend ? (
              <button className="following flex a-center">
                Sent request
                <img src="/check.png" alt="" />
              </button>
            ) : (
              <button className="follow" onClick={handleAddFriend}>
                Add Friend
              </button>
            )
          )}
        </div>
      </div>
      <div className="profile-section flex j-between">
        <div className="portfolio">
          <h3>Portfolio</h3>
          <div className="wrapper">
            <i className="fa-solid fa-envelope"></i>
            <span>{userProfile.account.email}</span>
          </div>
          <div className="wrapper">
            <i className="fa-solid fa-comment"></i>
            <span>Bio</span>
            <textarea disabled name="" id="" cols="53" rows="10">
              {userProfile.bio}
            </textarea>
          </div>
          {userProfile.user_id === user?.user?.user_id && (
            <div className="edit-profile">
              <Link to="/profiledetail">Edit profile</Link>
            </div>
          )}
        </div>
        <div className="user-post">
          {userProfile.user_id === user?.user?.user_id && (
            <>
              <CreatePost
                setIsOpen={setIsOpen}
                profilePicture={userProfile.profile_picture}
              />
              <CreatePostModal
                modalIsOpen={modalIsOpen}
                setIsOpen={setIsOpen}
                user={user?.user}
              />
            </>
          )}

          {!isLoading ? (
            posts.length === 0 ? (
              <p style={{ textAlign: "center", marginTop: "2rem" }}>
                <b>No posts available</b>
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
                {posts.map((post) => (
                  <Post post={post} key={post.post_id} />
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
    </div>
  );
}
