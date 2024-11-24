const { Op, Sequelize, where } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { sequelize, posts, friendship, tags, tags_posts, bookmark, forum } = require('../models/models');
const AppError = require('../utils/appError');
const moment = require('moment');
const { comments, likes, user } = require('../models/models');
const { nanoid } = require('nanoid');

exports.addForum = catchAsync(async (req, res, next) => {
    const { forum_name, created_at } = req.body;
    const forums = await forum.create({
        forum_id: nanoid(30),
        forum_name,
        created_at,
    });
    if (!forums) {
        return next(new AppError('Error while adding f!', 500));
    }
    res.status(201).json({ status: 'success', data: forums });
});

exports.getAllForums = catchAsync(async (req, res, next) => {
    const forums = await forum.findAll({
        where: {forum_status : "0"}
    });

    if (!forums || forums.length === 0) {
        return next(new AppError('No forums found!', 404));
    }

    res.status(200).json({
        status: 'success',
        data: forums,
    });
});

exports.createPostToForums = catchAsync(async (req, res, next) => {
    const AccountID = req.params.id || req.account.accountID;
    const userinfo = await user.findOne({
        where: { accountID: AccountID },
    });
    const { forum_id, title, content, code, Tags, created_at } = req.body;

    // Bắt đầu một giao dịch
    const transaction = await sequelize.transaction();
    try {
        // Tạo bài viết
        const post = await posts.create(
            {
                post_id: nanoid(25),
                user_id: userinfo.user_id,
                title,
                content,
                code,
                Tags,
                created_at,
                forum_id: forum_id
            },
            { transaction }
        );

        if (!post) {
            throw new AppError('Error while creating post!', 500);
        }

        // Tách chuỗi tags thành mảng
        const tagList = Tags.split(',').map(tag => tag.trim());

        for (const tagName of tagList) {
            // Kiểm tra xem tag đã tồn tại chưa
            let tag = await tags.findOne({ where: { tag_name: tagName }, transaction });

            if (!tag) {
                // Nếu tag chưa tồn tại, tạo mới tag
                tag = await tags.create({ tag_name: tagName, detail: tagName }, { transaction });
            }

            // Lưu vào bảng tags_posts
            await tags_posts.create({ post_id: post.post_id, tag_id: tag.tag_id }, { transaction });
        }

        // Commit giao dịch
        await transaction.commit();

        res.status(201).json({ status: 'success', data: post });
    } catch (error) {
        // Rollback giao dịch trong trường hợp có lỗi
        await transaction.rollback();
        return next(error);
    }
});

exports.getPostForum = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const forumId = req.params.forum_id;
    const post_status = parseInt(req.query.post_status) || null;
    const offset = (page - 1) * limit;
    let whereConditions = {};
    const postsInForum = await posts.findAll({
        offset,
        limit,
        include: [
          {
            model: posts,
            as: 'commentPost',
            required: false, // Để tránh lỗi nếu không có comment
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
          { model: likes, as: 'likes' },
          {
            model: user,
            as: 'user',
            attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
            where: whereConditions,
          },
          {
            model: tags,
            as: 'tag_id_tags',
            attributes: ['tag_name'],
          },
        ],
        where: { original_post_id: null, post_status: post_status || "0", forum_id: forumId },
        attributes: ['title', 'created_at', 'post_id', 'post_status', 'hiddenBy'],
        order: [['created_at', 'DESC']],
      });

    if (!postsInForum) {
        return next(new AppError('No posts found in the forum', 404));
    }


    const postsWithCounts = postsInForum.map((post) => {
        const commentCount = post.commentPost.length;
        const likeCount = post.likes.length;
        const tagsString = post.tag_id_tags.map(tag => tag.tag_name).join(', ');
        return {
            ...post.toJSON(),
            commentCount,
            likeCount,
            tagsString,
        };
    });
    res.status(200).json({ status: 'success', data: postsWithCounts });
});


exports.deletedForum = catchAsync(async (req, res, next) => {
    const { forum_id } = req.body;
  
    // Xóa bài viết hoặc bình luận có original_post_id không null
    const deletedForum = await forum.destroy({
      where: {
        forum_id: forum_id
      },
    });
  
    if (!deletedForum) {
      return next(new AppError('You are not able to do this!', 403));
    }
  
    res.status(204).json({ status: 'success', message: "delete forum success" }); // Trả về data là null khi xóa thành công
});

exports.hideForum = catchAsync(async (req, res, next) => {
    const { forum_id } = req.body;
  
  
    const forums = await forum.findOne({
      where: { forum_id: forum_id },
      attributes: ['forum_id', 'forum_status'],
    });
  
    if (!forums) {
      return next(new AppError('forums not found!', 404));
    }
  
  
    if (forums.forum_status == '1') {
      return next(new AppError('forum_status is already hidden!', 400));
    }
  
  
    await forums.update(
      { forum_status: 1 },
      { where: { forum_id: forum_id } }
    );
  
    res.status(200).json({
      status: 'success',
      message: 'forums has been hidden successfully!',
    });
  });
exports.activeForum = catchAsync(async (req, res, next) => {
    const { forum_id } = req.body;
  
    const forums = await forum.findOne({
      where: { forum_id: forum_id },
      attributes: ['forum_id', 'forum_status'],
    });
  
    if (!forums) {
      return next(new AppError('forums not found!', 404));
    }
  
  
    if (forums.forum_status == '0') {
      return next(new AppError('forum_status is already active!', 400));
    }
  
  
    await forums.update(
      { forum_status: 0 },
      { where: { forum_id: forum_id } }
    );
  
    res.status(200).json({
      status: 'success',
      message: 'forums has been active successfully!',
    });
  });