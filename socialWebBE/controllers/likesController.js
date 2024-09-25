const { Op, Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { posts, bookmark, user, comments, likes } = require('../models/models');
const AppError = require('../utils/appError');
const moment = require('moment');

exports.likePost = catchAsync(async (req, res, next) => {
    const {user_id} = req.user;
    const { post_id } = req.body;
    console.log(user_id, post_id);
    const like = await likes.create({ user_id, post_id });
    res.status(201).json({ status: 'success', data: like });
});
exports.unlikePost = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { post_id } = req.body;
    const like = await likes.destroy({ where: { user_id, post_id } });
    if (!like) return next(new AppError('Error while delete like!', 400));
    res.status(204).json({ status: 'success', data: like });
});