/* eslint-disable react/prop-types */
import "../scss/Post.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

function Post({ post }) {
  const { post_id, title, tagsString, user, created_at, likeCount, commentCount } =
    post;
  const navigate = useNavigate();
  let date = new Date(created_at * 1000);
  let date_string = moment(date).format("LLL");
  return (
    <div className="post flex">
      <div className="stats">
        <p>{likeCount} Likes</p>
        <p>{commentCount} Comments</p>
      </div>
      <div className="question">
        <Link to={`/post/${post_id}`}>
          <h3 className="title">{title}</h3>
        </Link>
        <div className="tags flex ">
          {tagsString
            ?.split(",")
            .map((tag) => (
              <p key={tag}>{tag}</p>
            ))}
        </div>
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
  );
}

export default Post;
