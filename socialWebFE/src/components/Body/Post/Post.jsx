/* eslint-disable react/prop-types */
import "../../../scss/Post.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { Outlet, useMatch } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import axios from "axios";
import { useAuth } from "../../../AuthProvider.jsx";
import { toast } from "react-toastify";
function Post({ post, setRefresher, }) {
  const { post_id, title, tagsString, user, created_at, likeCount, commentCount, post_status, hiddenBy, forum, report_count } =
    post;
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const homeMatch = useMatch("/admin/*");
  let date = new Date(created_at * 1000);
  let date_string = moment(date).format("LLL");


  const handelHidePost = (post_id, RoleID) => {
    console.log(post_id);

    confirmAlert({
      title: `Hide Post "${title}"!`,
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
                setRefresher((prev) => !prev);
                navigate("/admin/postmanagement?post_status=0&limit=5&page=1");
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
  const handelAcctivePost = (post_id) => {
    console.log(post_id);

    confirmAlert({
      title: `Active Post "${title}"!`,
      message: "Are you sure to active this post?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios
              .patch(
                `${SERVER_DOMAIN}/activePost`,
                { post_id }, // Đảm bảo gửi đúng dữ liệu
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then(() => {
                toast.success("Post Active successfully!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
                setRefresher((prev) => !prev);
                if (location.pathname.startsWith("/admin")) {
                  navigate("/admin/postmanagement?post_status=1&limit=5&page=1");
                } else {
                  navigate(`/profile/${user.user_id}`); // Quay lại trang trước
                }
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
  return (
    <div className="div flex a-center">
      <div className="post flex">
        <div className="stats">
          <p>{likeCount} Likes</p>
          <p>{commentCount} Comments</p>
        </div>
        <div className="question">
          <div className="forum">
            <Link to={`/forum/${forum?.forum_id}`}>
              <span className="forum_name"> {forum?.forum_name}</span>
            </Link>
          </div>
          {homeMatch ? (
            <>
              <Link to={`/admin/postmanagement/post/${post_id}`}>
                <h3 className="title">{title}</h3>
              </Link>
            </>
          ) : (
            <Link to={`/post/${post_id}`}>
              <h3 className="title">{title}</h3>
            </Link>
          )}
          <div className="tags flex ">
            {tagsString
              ?.split(",")
              .map((tag) => (
                <p key={tag}>{tag}</p>
              ))}
          </div>
          {post_status === true ? (
            <p style={{ color: "red" }}>
              This post has been hidden by: {hiddenBy || "over 10 reports by another user"}
            </p>
          ) : (
            report_count > 5 && report_count <= 10 && (
              <p style={{ color: "red" }}>
                This post has {report_count} reports from other users
              </p>
            )
          )}

          <div className="post-info flex a-center">
            <img crossOrigin="anonymus" src={user?.profile_picture} alt="" />
            <p
              className="post-description"
              onClick={() => navigate(`/profile/${user?.user_id}`)}
            >
              {user?.first_name} {user?.last_name} | {date_string}
            </p>
          </div>
        </div>
      </div>
      {homeMatch ? (
        <>
          {(post_status === false ||(report_count >= 5 && report_count <= 10)) && (
            <button
              class="delete"
              onClick={() => handelHidePost(post_id, 'admin')}

            >
              <i class="fa-regular fa-eye-slash"></i>
            </button>
          )}
          {((post_status === true && hiddenBy === 'admin') || (report_count >= 5 && report_count <= 10)) && (
            <button
              class="delete"
              onClick={() => handelAcctivePost(post_id)}
            >
              <i class="fa-solid fa-check"></i>
            </button>
          )}


        </>
      ) : (
        <>
          {post_status === true && hiddenBy === 'user' && (
            <button
              class="delete"
              onClick={() => handelAcctivePost(post_id)}

            >
              <i class="fa-solid fa-check"></i>
            </button>
          )}
        </>
      )}
    </div>

  );
}

export default Post;
