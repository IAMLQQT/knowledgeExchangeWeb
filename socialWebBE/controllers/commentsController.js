const { Op, Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { posts, bookmark, user, comments, likes } = require('../models/models');
const AppError = require('../utils/appError');
const moment = require('moment');
const { nanoid } = require('nanoid');
const { messaging } = require('firebase-admin');
const { post } = require('../routes/postRoutes');

exports.addComment = catchAsync(async (req, res, next) => {
  const { user_id } = req.user;
  const { post_id, content, created_at } = req.body;
  const comment = await posts.create({
    post_id: nanoid(25),
    user_id,
    content,
    created_at,
    original_post_id: post_id
  });
  if (!comment) {
    return next(new AppError('Error while adding comment!', 500));
  }
  res.status(201).json({ status: 'success', data: comment });
});
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { post_id } = req.body;

  // Xóa bài viết hoặc bình luận có original_post_id không null
  const deletedPost = await posts.destroy({
    where: {
      post_id: post_id,
      original_post_id: { [Op.ne]: null }, // Dùng cú pháp Sequelize để kiểm tra khác null
    },
  });

  if (!deletedPost) {
    return next(new AppError('You are not able to do this!', 403));
  }

  res.status(204).json({ status: 'success', message: "delete comment success" }); // Trả về data là null khi xóa thành công
});

exports.editComment = catchAsync(async (req, res, next) => {
  const { user_id } = req.user;
  const { post_id, content, updated_at } = req.body;
  const post = await posts.findOne({
    where: { post_id: post_id },
    attributes: ['original_post_id'],
  });

  if (post && post.original_post_id === null) {
    return next(new AppError('You are not allowed to edit this post!', 403)); // Trả về lỗi nếu post có original_post_id là null
  }
  const editComment = await posts.update(
    { content, updated_at },
    { where: { post_id: post_id, user_id: user_id } },
  );
  if (!editComment) {
    return next(new AppError('You are not able to do this!', 403));
  }
  res.status(200).json({ status: 'success' });
});

exports.getCommentReplies = catchAsync(async (req, res, next) => {
  // Lấy post_id từ params
  const  post_id  = req.query.post_id;

  if (!post_id) {
    return next(new AppError("post_id is required in the URL parameters!", 400));
  }

  try {
    // Hàm đệ quy để xây dựng cây bình luận
    const buildCommentTree = async (parentId) => {
      // Lấy các replies trực tiếp từ DB
      const replies = await posts.findAll({
        where: { original_post_id: parentId },
        attributes: ["post_id", "content", "created_at", "user_id", "original_post_id"],
        include: [
          {
            model: user,
            as: "user",
            attributes: ["user_id", "first_name", "last_name", "profile_picture"],
          },
        ],
      });

      // Gọi đệ quy để lấy replies của các replies này
      const repliesWithChildren = await Promise.all(
        replies.map(async (reply) => ({
          ...reply.toJSON(),
          replies: await buildCommentTree(reply.post_id), // Đệ quy để lấy cấp con
        }))
      );

      return repliesWithChildren;
    };

    // Lấy các bình luận chính (original_post_id là null hoặc bằng post_id gốc)
    const mainComments = await posts.findAll({
      where: { original_post_id: post_id }, // Sử dụng post_id từ params
      attributes: ["post_id", "content", "created_at", "user_id", "original_post_id"],
      include: [
        {
          model: user,
          as: "user",
          attributes: ["user_id", "first_name", "last_name", "profile_picture"],
        },
      ],
    });

    // Xây dựng cấu trúc cây từ các bình luận chính
    const commentTree = await Promise.all(
      mainComments.map(async (comment) => ({
        ...comment.toJSON(),
        replies: await buildCommentTree(comment.post_id),
      }))
    );

    // Trả về kết quả

    return res.status(200).json({
      status: "success",
      data: commentTree,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



// exports.getCommentReplies = catchAsync(async (req, res, next) => {
//   const post_id = req.query.post_id;

//   if (!post_id) {
//     return res.status(400).json({ message: "post_id is required in query parameters." });
//   }

//   try {
//     // Lấy tất cả các bình luận và trả lời từ cơ sở dữ liệu
//     const allComments = await posts.findAll({
//       where: { post_id, original_post_id: { [Op.ne]: null } },
//       attributes: ["post_id", "content", "created_at", "user_id", "original_post_id"],
//       include: [
//         {
//           model: user,
//           as: "user",
//           attributes: ["user_id", "first_name", "last_name", "profile_picture"],
//         },
//       ],
//     });
//     console.log("đây là: ", allComments);
    
//     if (!allComments || allComments.length === 0) {
//       return next(new AppError("There are no comments or replies!", 200));
//     }

//     // Chuyển dữ liệu thành dạng plain object để dễ xử lý
//     const comments = allComments.map((comment) => comment.toJSON());

//     // Tạo cấu trúc cha-con bằng cách dùng Map
//     const commentMap = new Map();

//     comments.forEach((comment) => {
//       comment.replies = []; // Thêm mảng replies vào mỗi comment
//       commentMap.set(comment.original_post_id, comment); // Lưu vào Map với key là post_id
//     });

//     // Gắn replies vào các comment cha
//     const rootComments = [];

//     comments.forEach((comment) => {
//       if (comment.original_post_id) {
//         const parentComment = commentMap.get(comment.original_post_id);
//         if (parentComment) {
//           parentComment.replies.push(comment);
//         }
//       } else {
//         rootComments.push(comment); // Đây là các bình luận gốc (main comments)
//       }
//     });

//     // Trả về danh sách bình luận gốc, bao gồm các trả lời lồng nhau
//     return res.status(200).json(rootComments);
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

