import "../scss/CreatePost.scss";
// eslint-disable-next-line react/prop-types
function CreatePost({ setIsOpen, profilePicture }) {
  return (
    <div className="create-post flex">
      <div className="post-content flex a-center ">
        <img
          crossOrigin="anonymous"
          src={profilePicture ? profilePicture : "/user.png"}
          alt="user-ava"
        />
        <input
          type="text"
          placeholder="What's on your mind?"
          onClick={() => setIsOpen(true)}
        />
      </div>
    </div>
  );
}

export default CreatePost;
