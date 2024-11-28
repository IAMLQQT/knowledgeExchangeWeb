/* eslint-disable react/prop-types */
import "../../../scss/Post.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { Outlet, useMatch } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import axios from "axios";
import { useAuth } from "../../../AuthProvider.jsx";
import { toast } from "react-toastify";
function Forum({ forum, setRefresher, }) {
  const { forum_id, forum_name, forum_description, post_count, user, created_at, forum_status } =
    forum;
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const homeMatch = useMatch("/admin/*");
  let date = new Date(created_at * 1000);
  let date_string = moment(date).format("LLL");


  const handelHideForum = (forum_id) => {
    confirmAlert({
      title: `Hide Forum "${forum_name}"!`,
      message: "Are you sure to hide this post?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios
              .patch(
                `${SERVER_DOMAIN}/admin/hideForum`,
                { forum_id }, // Đảm bảo gửi đúng dữ liệu
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then(() => {
                toast.success("Forum hidden successfully!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
                setRefresher((prev) => !prev);
                navigate("/admin/forummanagement?forum_status=0&limit=5&page=1");
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
  const handelAcctiveForum = (forum_id) => {

    confirmAlert({
      title: `Active Forum "${forum_name}"!`,
      message: "Are you sure to active this post?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios
              .patch(
                `${SERVER_DOMAIN}/admin/activeForum`,
                { forum_id }, // Đảm bảo gửi đúng dữ liệu
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then(() => {
                toast.success("Forum Active successfully!", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 5000,
                });
                setRefresher((prev) => !prev);
                navigate("/admin/forummanagement?forum_status=1&limit=5&page=1");
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
          <p>{post_count}</p>
        </div>
        <div className="question">
          {homeMatch ? (
            <>
              <Link to={`/admin/forummanagement/${forum_id}`}>
                <h3 className="title">{forum_name}</h3>
              </Link>
            </>
          ) : (
            <Link to={`/forum/${forum_id}`}>
              <h3 className="title">{forum_name}</h3>
            </Link>
          )}
          <p className="forum_description">{forum_description}</p>
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
          {forum_status === false && (
            <button
              class="delete"
              onClick={() => handelHideForum(forum_id)}

            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          )}
          {forum_status === true && (
            <button
              class="delete"
              onClick={() => handelAcctiveForum(forum_id)}

            >
              <i class="fa-solid fa-check"></i>
            </button>
          )}

        </>
      ) : (
        <>
          {forum_status === true && (
            <button
              class="delete"
              onClick={() => handelAcctiveForum(forum_id)}

            >
              <i class="fa-solid fa-check"></i>
            </button>
          )}
        </>
      )}
    </div>

  );
}

export default Forum;
