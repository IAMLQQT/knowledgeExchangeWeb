const { Op, Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { posts, bookmark,  user, comments, likes, tags} = require('../models/models');
const AppError = require('../utils/appError');
const moment = require('moment');

exports.savePost = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { post_id, saved_at } = req.body;
    const save = await bookmark.create({ user_id, post_id, saved_at });
    if (!save) return next(new AppError('Error while saving post!', 400));
    res.status(201).json({ status: 'success', data: save });
  });
  exports.unsavePost = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const { post_id } = req.body;
    const save = await bookmark.destroy({ where: { user_id, post_id } });
    if (!save) return next(new AppError('Error while unsaving post!', 400));
    res.status(204).json({ status: 'success', data: save });
  });
  exports.getSavedPosts = catchAsync(async (req, res, next) => {
    const { user_id } = req.user;
    const limit = req.query.limit * 1 || 10;
    const page = req.query.page * 1 || 1;
    const offset = (page - 1) * limit;
    const savedPosts = await bookmark.findAll({
      offset,
      limit,
      where: { user_id },
      include: [
        {
          model: posts,
          as: 'post',
          include: [
            {
              model: posts,
              as: 'commentPost',
              required: false, 
              attributes: ["post_id", "content", "created_at", "post_status", "user_id", "original_post_id"],
              include: [
                {
                  model: user,
                  as: 'user',
                  attributes: [
                    'user_id',
                    'first_name',
                    'last_name',
                    'profile_picture',
                  ],
                },
              ],
            },
            {
              model: likes,
              as: 'likes',
            },
            {
              model: user,
              as: 'user',
              attributes: [
                'user_id',
                'first_name',
                'last_name',
                'profile_picture',
              ],
            },
            {
              model: tags,
              as: 'tag_id_tags',
              attributes: ['tag_name'],
            },
          ],
          attributes: [
            'post_id',
            'title',
            'created_at',
          ],
          order: [['saved_at', 'DESC']],
        },
      ],
    });
    res.status(200).json({ status: 'success', data: savedPosts });
  });
  