import Comment from "./Comment";

function RelyComment({
  comment,
  userId,
  setRefresher,
  token,
  postDetail,
  setPostDetail,
}) {
  return (
    <div className="rely-comments">
      {/* Render tầng replies của comment gốc */}
      <Comment
        comment={comment}
        userId={userId}
        setRefresher={setRefresher}
        token={token}
        postDetail={postDetail}
        setPostDetail={setPostDetail}
      />
      
    </div>
  );
}

export default RelyComment;
