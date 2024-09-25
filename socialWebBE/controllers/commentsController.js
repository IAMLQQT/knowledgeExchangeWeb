const { Op, Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { posts, bookmark,  user, comments, likes} = require('../models/models');
const AppError = require('../utils/appError');
const moment = require('moment');

exports.addComment = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { post_id, content, created_at } = req.body;
    const comment = await comments.create({
      user_id,
      post_id,
      content,
      created_at,
    });
    if (!comment) {
      return next(new AppError('Error while adding comment!', 500));
    }
    res.status(201).json({ status: 'success', data: comment });
  });
exports.deleteComment = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { comment_id } = req.body;
    const comment = await comments.destroy({
      where: { comment_id: comment_id, user_id: user_id },
    });
    if (!comment) {
      return next(new AppError('You are not able to do this!', 403));
    }
    res.status(204).json({ status: 'success', data: comment });
});
exports.editComment = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { comment_id, content, updated_at } = req.body;
    const comment = await comments.update(
      { content, updated_at },
      { where: { comment_id: comment_id, user_id: user_id } },
    );
    if (!comment) {
      return next(new AppError('You are not able to do this!', 403));
    }
    res.status(200).json({ status: 'success' });
});