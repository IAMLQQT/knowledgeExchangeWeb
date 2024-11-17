/* eslint-disable react/prop-types */

import moment from "moment";
import { useEffect, useRef, useState } from "react";
import "../../../scss/Comment.scss";
import axios from "axios";
import { toast } from "react-toastify";
import ShowMoreText from "react-show-more-text";
import { Navigate, useNavigate } from "react-router-dom";
import { Outlet, useMatch } from "react-router-dom";
import { useUser } from "../../../UserProvider";
function Comment({
  comment,
  userId,
  setRefresher,
  token,
  postDetail,
  setPostDetail,
}) {
  const modalRef = useRef();
  const [isDropdown, setIsDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRely, setIsRely] = useState(false);
  const [curComment, setCurComment] = useState(comment.content);
  const [editTime, setEditTime] = useState(comment.updated_at);
  const [editedComment, setEditedComment] = useState(comment.content);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  const homeMatch = useMatch("/admin/*");
  const { user } = useUser();
  const handleEditComment = () => {
    setCurComment(editedComment);
    setIsEditing(false);
    const editTimeUnix = moment().unix();
    setEditTime(editTimeUnix);
    axios
      .patch(
        `${SERVER_DOMAIN}/editComment`,
        {
          post_id: comment.post_id,
          content: editedComment,
          updated_at: editTimeUnix,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => { })
      .catch(() => {
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };
  const handelRelyButton = () => {
    setIsRely(true);
  }
  const handleEditButton = () => {
    setIsDropdown(false);
    setIsEditing(true);
  };
  const handleDeleteComment = () => {
    const newComments = postDetail.commentPost.filter(
      (cmt) => cmt.post_id != comment.post_id
    );
    setPostDetail({ ...postDetail, commentPost: newComments });
    axios
      .delete(`${SERVER_DOMAIN}/deleteComment`, {
        data: {
          post_id: comment.post_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        toast.success("Delete comment successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
        setRefresher((prev) => !prev);
      })
      .catch(() => {
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        console.log(modalRef.current.contains(event.target));
        setIsDropdown(false);
      }
    };

    if (isDropdown) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdown]);
  useEffect(() => {
    const handleEscapeEvent = (e) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setIsRely(false);
      }
    };

    if (isEditing) window.addEventListener("keydown", handleEscapeEvent);
    if (isRely) window.addEventListener("keydown", handleEscapeEvent);
    return () => window.removeEventListener("keydown", handleEscapeEvent);
  }, [isEditing, isRely]);
  return (
    <div className="comment-detail flex" key={comment.comment_id}>
      <img
        crossOrigin="anonymous"
        src={comment.user.profile_picture}
        alt="user-ava"
      />
      <div className="wrapper">
        <h3 onClick={() => navigate("/profile/" + comment.user.user_id)}>
          {comment.user.first_name} {comment.user.last_name}
        </h3>

        {isEditing && (
          <>
            <div className="edit-comment">
              <textarea
                type="text"
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                minLength={1}
              />

              <img
                src="/comment-icon.png"
                alt="Edit comment icon"
                onClick={handleEditComment}
              />
            </div>
            <p className="cancle-noti">
              Press Esc to <u onClick={() => setIsEditing(false)}>cancle</u>.
            </p>
          </>
        )}
        {!isEditing && (
          <>
            <ShowMoreText
              lines={5}
              more="Show more"
              less="Show less"
              className="expanded-comment"
              anchorClass="show-more-less-clickable"
              onClick={null}
              expanded={false}
              truncatedEndingComponent={"... "}
            >
              <p>{curComment} </p>
            </ShowMoreText>
            <p className="comment-time">
              {editTime
                ? moment(editTime * 1000).format("LLL") + " (edited)"
                : comment.created_at
                  ? moment(comment.created_at * 1000).format("LLL")
                  : "Date not available"}
            </p>
          </>
        )}

        {isRely ? (
          <>
            <div className="rely-comment">
              <img
                crossOrigin="anonymous"
                src={user?.user?.profile_picture || "/user.png"}
                alt="user-ava"
              />
              <div className="warrper-rely  ">
                <h3>{user?.user?.first_name} {user?.user?.last_name}</h3>
                <textarea
                  type="text"
                  placeholder="Write something..."
                  value={""}
                // onChange={""}
                ></textarea>
                <img
                  src="/comment-icon.png"
                  alt="comment icon"
                  className="comment-icon"
                // onClick={handleSubmitComment}
                />
              </div>

            </div>
            <p className="cancle-noti">
              Press Esc to <u onClick={() => setIsRely(false)}>cancle</u>.
            </p>
          </>
        ) : (
          <button className="rely-button" onClick={handelRelyButton}>Rely</button>
        )}
      </div>

      {homeMatch ? (
        <>
          <Outlet />
        </>
      ) : (
        <button
          type="button"
          className="modify-button"
          onClick={() => setIsDropdown(true)}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      )}
      {isDropdown && (
        <ul className="modify-dropdown" ref={modalRef}>
          {userId === comment?.user?.user_id && (
            <>
              <li>
                <button type="button" onClick={handleEditButton}>
                  Edit
                </button>
              </li>
              <li>
                <button type="button" onClick={handleDeleteComment}>
                  Delete
                </button>
              </li>
            </>
          )}
          {userId !== comment?.user?.user_id && (
            <>
              <li>
                <button type="button">Report</button>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}

export default Comment;
