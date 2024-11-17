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