import { Code } from "react-content-loader";
import "../../../scss/PostDetail.scss";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../AuthProvider.jsx";
import CodeBlock from "../Message/CodeBlock.jsx";
import axios from "axios";
import moment from "moment";
import { useUser } from "../../../UserProvider.jsx";
import Comment from "./Comment.jsx";
import EditPostModal from "../Modals/EditPostModal.jsx";
import { confirmAlert } from "react-confirm-alert";
import { Outlet, useMatch } from "react-router-dom";
export default function PostDetail() {
  const modalRef = useRef();
  const [refresher, setRefresher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postDetail, setPostDetail] = useState(null);
  const [userComment, setUserComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdown, setIsDropdown] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isModifyOpen, setModifyOpen] = useState(false);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useAuth();
  const { postId } = useParams();
  const { user } = useUser();
  const likeListRef = useRef();
  const modifyRef = useRef();
  const navigate = useNavigate();
  const homeMatch = useMatch("/admin/*");
  const handelSavePostButton = () => {
    console.log(postDetail);
    if (!postDetail.isSaved) {
      setPostDetail({
        ...postDetail,
        isSaved: true,
        User_saved_posts: [
          ...(postDetail.User_saved_posts || []), // Kiểm tra nếu User_saved_posts là null hoặc undefined, thì sử dụng một mảng trống
          { user_id: user.user.user_id, post_id: postDetail.post_id },
        ],
      });
      axios
        .post(
          `${SERVER_DOMAIN}/savepost`,
          {
            post_id: postId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => { })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    } else {
      setPostDetail({
        ...postDetail,
        isSaved: false,
        User_saved_posts: (postDetail.User_saved_posts || []).filter(
          (save) => save.user_id !== user.user.user_id
        ),
      });
      axios
        .delete(`${SERVER_DOMAIN}/unSavePost/`, {
          data: {
            post_id: postId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => { })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    }
  };

  const handleLikeButton = () => {
    console.log(postDetail);
    if (!postDetail.isLiked) {
      setPostDetail({
        ...postDetail,
        isLiked: true,
        likes: [
          ...postDetail.likes,
          { user_id: user.user_id, post_id: postDetail.post_id },
        ],
      });
      axios
        .post(
          `${SERVER_DOMAIN}/likePost`,
          {
            post_id: postId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => { setRefresher(!refresher); })
        .catch((err) => {
          console.log(err);

          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    } else {
      axios
        .delete(`${SERVER_DOMAIN}/unlikePost/`, {
          data: {
            post_id: postId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setPostDetail({
            ...postDetail,
            isLiked: false,
            likes: postDetail.likes.filter(
              (like) => like.user_id !== user.user.user_id
            ),
          });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    }
  };
  const handleEditButton = () => {
    setIsEditModalOpen(true);
  };
  const handelHidePost = (post_id, RoleID) => {
    console.log(post_id);
    confirmAlert({
      title: `Hide Post "${postDetail.title}"!`,
      message: "Are you sure to hide this post?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios
              .patch(
                `${SERVER_DOMAIN}/hidePost`,
                { post_id, RoleID }, // Đảm bảo gửi đúng dữ liệu
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then(() => {
                toast.success("Post hidden successfully!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
                navigate(-1);
                setRefresher((prev) => !prev);
              })
              .catch((err) => {
                console.error(err);
                toast.error("Something went wrong! Please try again!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
              });
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };
  const handleDeletePost = () => {
    confirmAlert({
      title: "Delete post!",
      message: "Are you sure to delete this post?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios
              .delete(`${SERVER_DOMAIN}/deletePost`, {
                data: {
                  post_id: postId,
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                toast.success("Post deleted successfully!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
                navigate("/login");
              })
              .catch((err) => {
                console.log(err);
                toast.error("Something went wrong! Please try again!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
              });
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };
  const handleUserComment = (e) => {
    setUserComment(e.target.value);
    autoResizeTextarea(e.target);
  };
  const autoResizeTextarea = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 25}px`;
  };
  const handleReportPost = () => {
    toast.info("This feature is not available yet!", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 5000,
    });
  };
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (userComment === "") {
      return;
    }

    axios
      .post(
        `${SERVER_DOMAIN}/addComment`,
        {
          post_id: postId,
          content: userComment,
          created_at: moment().unix(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setUserComment("");
        setRefresher(!refresher);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };

  useEffect(() => {
    const apiEndpoint = token
      ? `${SERVER_DOMAIN}/postdetail/${postId}`
      : `${SERVER_DOMAIN}/postdetailwithouttoken/${postId}`;

    axios
      .get(apiEndpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setPostDetail(res.data.data);
        setIsLoading(false);
        console.log("postdetail", res.data.data.commentPost);
      })
      .catch((err) => {
        setIsNotFound(true);
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
        console.log(err);
      });
  }, [postId, refresher]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (likeListRef.current && !likeListRef.current.contains(e.target)) ||
        (modifyRef.current && !modifyRef.current.contains(e.target))
      ) {
        setIsModalOpen(false);
        setModifyOpen(false);
      }
    };
    if (isModalOpen || isModifyOpen)
      window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen, isModifyOpen]);
  if (isNotFound)
    return (
      <div className="post-not-found">
        <h2>Post not found!</h2>
      </div>
    );
  if (isLoading) {
    return <Code />;
  }
  return (
    <div className="post-detail">
      <div className="post-detail-header flex a-center j-between">
        <h1>{postDetail?.title}</h1>
        {homeMatch ? (
          <>
            <Outlet />
          </>
        ) : (
          <div>
            {token &&
              <div className="post-detail-header-btn">
                <button className="post-save" onClick={handelSavePostButton}>
                  <i
                    className={`${postDetail?.isSaved ? "fa-solid" : "fa-regular"
                      } fa-bookmark`}
                  ></i>
                </button>
                <button className="post-like" onClick={handleLikeButton}>
                  <i
                    className={`${postDetail?.isLiked ? "fa-solid" : "fa-regular"
                      } fa-heart`}
                  ></i>
                </button>
                <button
                  className="post-edit"
                  onClick={() => setModifyOpen((prev) => !prev)}
                >
                  <i className="fa-solid fa-ellipsis"></i>
                  {isModifyOpen && (
                    <ul className="modify-dropdown" ref={modifyRef}>
                      {postDetail.user_id === user?.user.user_id ? (
                        <>
                          <li>
                            <button type="button" onClick={handleEditButton}>
                              Edit
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => handelHidePost(postDetail.post_id, 'user')}>
                              Hidden
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={handleDeletePost}>
                              Delete
                            </button>
                          </li>
                        </>
                      ) : (<li>
                        <button type="button" onClick={handleReportPost}>
                          Report
                        </button>
                      </li>)}
                    </ul>
                  )}
                </button>
              </div>
            }
          </div>
        )}


      </div>
      <div className="post-detail-content">
        <p className="post-content">{postDetail?.content}</p>
      </div>
      {postDetail?.code && (
        <div className="post-detail-code">
          <CodeBlock codeString={postDetail?.code} />
        </div>
      )}

      <div className="post-detail-hashtag">
        {postDetail?.tags?.split(",").map((tag) => (
          <span className="hashtag" key={tag}>
            #{tag}
          </span>
        ))}
      </div>
      <div className="post-detail-description flex a-center j-between">
        <div className="post-detail-voting">
          <span
            className="number-of-likes"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fa-solid fa-heart"></i> {postDetail?.likes?.length}{" "}
            Likes
          </span>
          <span className="number-of-comment">
            <i className="fa-solid fa-comments"></i>{" "}
            {postDetail?.comments?.length} Comments
          </span>
        </div>
        <div className="post-info flex a-center">
          <img
            crossOrigin="anonymus"
            src={postDetail?.user?.profile_picture}
            alt=""
          />
          <p
            className="post-description"
            onClick={() =>
              navigate(`/profile/${postDetail?.user?.user_id}`)
            }
          >
            {postDetail?.user?.first_name} {postDetail?.user?.last_name} |{" "}
            {moment.unix(postDetail?.created_at).format("LLL")}
          </p>
        </div>
      </div>


      {homeMatch ? (
        <>
          <Outlet />
        </>
      ) : (
        <div>
          {token && <div className="post-detail-create-comment flex a-center ">
            <img
              crossOrigin="anonymous"
              src={user?.user?.profile_picture || "/user.png"}
              alt="user-ava"
            />
            <textarea
              type="text"
              placeholder="Write something..."
              value={userComment}
              onChange={handleUserComment}
            ></textarea>

            <img
              src="/comment-icon.png"
              alt="comment icon"
              className="comment-icon"
              onClick={handleSubmitComment}
            />
          </div>
          }
        </div>

      )}
      <div className="post-detail-comment">
        {postDetail?.commentPost.map((comment) => (
          <Comment
            comment={comment}
            key={comment.comment_id}
            setRefresher={setRefresher}
            postDetail={postDetail}
            setPostDetail={setPostDetail}
            userId={user?.user?.user_id}
            token={token}
          />
        ))}
      </div>
      {isModalOpen && (
        <ul className="like-list" ref={likeListRef}>
          <h2>Who likes</h2>
          <img
            src="/close.png"
            alt="/close.png"
            className="btn-close"
            onClick={() => setIsModalOpen(false)}
          />

          {postDetail?.likes?.map((like) => (
            <li key={like?.user_id}>
              <button
                type="button"
                className="flex a-center"
                onClick={() => navigate(`/profile/${like?.user_id}`)}
              >
                <img
                  crossOrigin="anonymus"
                  src={like?.user?.profile_picture}
                  alt="Profile Picture"
                />
                <p>
                  {like.user?.first_name} {like?.user?.last_name}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
      <EditPostModal
        setIsOpen={setIsEditModalOpen}
        isModalOpen={isEditModalOpen}
        curTitle={postDetail?.title}
        curContent={postDetail?.content}
        curCode={postDetail?.code}
        curTags={postDetail.tags}
        user={user?.user}
        postId={postId}
        setRefresher={setRefresher}
      />
    </div>
  );


}
