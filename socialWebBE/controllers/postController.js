/* eslint-disable camelcase */
const { Op, Sequelize, where } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { sequelize, posts, friendship, tags, tags_posts, bookmark } = require('../models/models');
const AppError = require('../utils/appError');
const moment = require('moment');
const { comments, likes, user } = require('../models/models');
const { nanoid } = require('nanoid');

exports.getPosts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const userId = req.query.userId || null;
  // const userIdToken = req.user.user_id;
  const offset = (page - 1) * limit;
  const sorted = req.query.sorted;
  let whereConditions = {};

  // if (sorted === 'community') {
  //   // Get following users' IDs
  //   const friendships = await friendship.findAll({
  //     where: { user_id: userId },
  //     attributes: ['user_friend_id'],
  //   });
  //   const friendshipsID = friendships.map((f) => f.user_friend_id);
  //   console.log(friendshipsID);

  //   // Create OR conditions for community sorting
  //   whereConditions = {
  //     user_id: { [Op.in]: friendshipsID },
  //   };
  // } else if (userId) {
  //   whereConditions.user_id = userId;
  // }

  const newsfeed = await posts.findAll({
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
    where: { original_post_id: null,  post_status: '0'},
    attributes: ['title', 'created_at', 'post_id'],
    order: [['created_at', 'DESC']],
  });

  if (!newsfeed) {
    return next(new AppError('Error while getting newsfeed', 404));
  }
 
  const postsWithCounts = newsfeed.map((post) => {
    const commentCount = post.commentPost.length;
    const likeCount = post.likes.length;
    const tagsString = post.tag_id_tags.map(tag => tag.tag_name).join(', ');
    return {
      ...post.toJSON(),
      commentCount,
      likeCount,
      tagsString
    };
  });

  res.status(200).json({ status: 'success', data: postsWithCounts });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const AccountID = req.params.id || req.account.accountID;
  const userinfo = await user.findOne({
    where: { accountID: AccountID },
  });
  const { title, content, code, Tags, created_at } = req.body;

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
        created_at
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
exports.getPostDetail = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await posts.findOne({
    where: { post_id: postId },
    include: [
      {
        model: posts,
        as: 'commentPost',
        where: { original_post_id: postId }, // Lọc các bài viết có original_post_id trùng với post_id
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
      {
        model: likes,
        as: 'likes',
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
        model: user,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
      },
      {
        model: tags,
        as: 'tag_id_tags',
        attributes: ['tag_name'],
      },
      {
        model: bookmark,
        as: "bookmarks"
      }
    ],
  });

  if (!post) {
    return next(new AppError("Couldn't find post!", 404));
  }

  // Chuyển đổi danh sách tag thành chuỗi
  const postSanitized = post.get({ plain: true });
  const isLiked = !!postSanitized.likes.find(
    (like) => like.user_id === req.user.user_id
  );
  const isSaved = !!postSanitized.bookmarks.find(
    (user) => user.user_id === req.user.user_id
  );
  // Lấy các tags và chuyển thành chuỗi
  const tagsString = postSanitized.tag_id_tags.map(tag => tag.tag_name).join(', ');

  // Thêm các thuộc tính vào đối tượng bài viết
  postSanitized.isLiked = isLiked;
  postSanitized.tags = tagsString;
  postSanitized.isSaved = isSaved;
  res.status(200).json({ status: 'success', data: postSanitized });
});
exports.getPostDetailWithoutToken = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await posts.findOne({
    where: { post_id: postId },
    include: [
      {
        model: comments,
        as: 'comments',
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
        model: user,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
      },
      {
        model: tags,
        as: 'tag_id_tags',
        attributes: ['tag_name'],
      },
    ],
  });

  if (!post) {
    return next(new AppError("Couldn't find post!", 404));
  }

  // Chuyển đổi danh sách tag thành chuỗi
  const postSanitized = post.get({ plain: true });
  // Lấy các tags và chuyển thành chuỗi
  const tagsString = postSanitized.tag_id_tags.map(tag => tag.tag_name).join(', ');

  // Thêm các thuộc tính vào đối tượng bài viết
  postSanitized.tags = tagsString;
  res.status(200).json({ status: 'success', data: postSanitized });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { title, content, code, Tags, update_at } = req.body;
  const { postId } = req.params;
  const { user_id } = req.user;
  console.log("day la post id:" + postId);
  console.log("day la user_id:" + user_id);

  const transaction = await sequelize.transaction();

  try {
    // Cập nhật post
    const post = await posts.update(
      { title, content, code, Tags, update_at },
      { where: { post_id: postId, user_id: user_id }, transaction }
    );

    if (!post) {
      return next(new AppError('Error while updating post!', 500));
    }

    // Xóa các liên kết tags_posts cũ
    await tags_posts.destroy({ where: { post_id: postId }, transaction });

    const tagList = Tags.split(',').map(tag => tag.trim());

    for (const tagName of tagList) {
      // Kiểm tra xem tag đã tồn tại chưa
      let tag = await tags.findOne({ where: { tag_name: tagName }, transaction });

      if (!tag) {
        // Nếu tag chưa tồn tại, tạo mới tag
        tag = await tags.create({ tag_name: tagName, detail: tagName }, { transaction });
      }

      // Lưu vào bảng tags_posts
      await tags_posts.create({ post_id: postId, tag_id: tag.tag_id }, { transaction });
    }

    // Commit giao dịch
    await transaction.commit();

    // Trả về kết quả
    res.status(200).json({ status: 'success', data: { postId, title, content, code, Tags, update_at } });

  } catch (error) {
    // Rollback giao dịch trong trường hợp có lỗi
    await transaction.rollback();
    return next(error);
  }
});


const isValidDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date, format, true).isValid();
};
const extractTagValue = (input) => {
  const regex = /@(\w+):([^"]+)/g;
  const regex2 = /@(\w+):"([^"]*)"/g;
  let match;
  const searchValue = {};
  const allowedOptions = ['tag', 'user', 'comments', 'likes', 'profile'];
  while (
    (match = regex.exec(input)) !== null ||
    (match = regex2.exec(input)) !== null
  ) {
    const tag = match[0];
    const tagName = match[1];
    const tagValue = match[2];
    if (allowedOptions.includes(tagName)) {
      searchValue[tagName] = tagValue;
    }
    if (tagName === 'date' && isValidDate(tagValue)) {
      searchValue[tagName] = tagValue;
    }
    console.log(`Tag: ${tag}, Name: ${tagName}, Value: ${tagValue}`);
  }

  const generalSearch = input
    .replace(regex, '')
    .replace(regex2, '')
    .trim()
    .replace(/\s+/g, ' ');
  searchValue['general'] = generalSearch;
  console.log(searchValue);
  console.log(`General search: ${generalSearch}`);

  return searchValue;
};
exports.searchPost = catchAsync(async (req, res, next) => {
  const {
    general = null,
    tag = null,
    users = null,
    date = null,
  } = extractTagValue(req.query.q);
  if (general === null && tag === null && users === null && date === null) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide search criteria!',
    });
  }

  const searchCriteria = {};

  if (general !== null) {
    searchCriteria.title = {
      [Op.like]: `%${general}%`,
    };
    searchCriteria.content = {
      [Op.like]: `%${general}%`,
    };
  }

  if (tag !== null) {
    searchCriteria.tags = {
      [Op.like]: `%${tag}%`,
    };
  }
  const userCriteria = {};
  if (users !== null) {
    userCriteria[Op.or] = [
      Sequelize.where(
        Sequelize.fn(
          'concat',
          Sequelize.col('first_name'),
          ' ',
          Sequelize.col('last_name'),
        ),
        {
          [Op.like]: `%${user}%`,
        },
      ),
      Sequelize.where(
        Sequelize.fn(
          'concat',
          Sequelize.col('last_name'),
          ' ',
          Sequelize.col('first_name'),
        ),
        {
          [Op.like]: `%${user}%`,
        },
      ),
    ];
  }
  console.log("dday laf ",userCriteria);
  if (date !== null) {
    const unixDate = moment(date, 'DD/MM/YYYY').unix();
    searchCriteria.created_at = {
      [Op.gte]: unixDate,
    };
  }
  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const offset = (page - 1) * limit;
  const isSorted = req.query.sorted === 'newest';
  const searchResult = await posts.findAll({
    offset: offset,
    limit: limit,
    where: searchCriteria,
    include: [
      { model: comments, as: 'comments' },
      { model: likes, as: 'likes' },
      {
        model: user,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
        // where: whereConditions,
      },
      {
        model: tags,
        as: 'tag_id_tags',
        attributes: ['tag_name'],
      },
    ],
    order: isSorted ? [['created_at', 'DESC']] : null,
  });
  // Query to get the total count
  const totalCount = await posts.count({
    where: searchCriteria,
    include: [
      {
        model: user,
        as: 'user',
        where: userCriteria,
      },
    ],
  });
  if (!searchResult)
    return next(new AppError('Error while getting newsfeed', 404));

  const postsWithCounts = searchResult.map((post) => {
    const commentCount = post.comments.length;
    const likeCount = post.likes.length;
    const tagsString = post.tag_id_tags.map(tag => tag.tag_name).join(', ');
    return {
      ...post.toJSON(),
      commentCount,
      likeCount,
      tagsString,
      comments: undefined,
      likes: undefined,
    };
  });
  const totalPage = Math.ceil(totalCount / limit);
  res.status(200).json({
    status: 'success',
    data: postsWithCounts,
    page,
    totalPages: totalPage,
  });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const posts = await posts.findAll({
    where: { user_id: userId },
    include: [
      { model: comments, as: 'comments' },
      { model: likes, as: 'likes' },
      {
        model: user,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
      },
    ],
  });
  if (!posts) {
    return next(new AppError('Error while getting user posts!', 500));
  }
  res.status(200).json({ status: 'success', data: posts });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { user_id } = req.user;
  const { post_id } = req.body;
  likes.destroy({
    where: { post_id: post_id },
  })
    .then(() =>
      comments.destroy({
        where: { post_id: post_id },
      }),
    )
    .then(() =>
      bookmark.destroy({
        where: { post_id: post_id },
      }),
    )
    .then(() => 
      tags_posts.destroy({
        where : {post_id: post_id}
      })
    )
    .then(() =>
      posts.destroy({
        where: { user_id: user_id, post_id: post_id },
      }),
    )
  res.status(204).json({ status: 'success' });
});

exports.hidePost = catchAsync(async (req, res, next) => {
  const { post_id } = req.body;

 
  const post = await posts.findOne({
    where: { post_id: post_id, original_post_id: null },
    attributes: ['post_status'],
  });

  if (!post) {
    return next(new AppError('Post not found!', 404));
  }

  
  if (post.post_status == '1') {
    return next(new AppError('Post is already hidden!', 400));
  }

  
  await posts.update(
    { post_status: 1 },
    { where: { post_id: post_id, original_post_id: null} }
  );

  res.status(200).json({
    status: 'success',
    message: 'Post has been hidden successfully!',
  });
});
exports.activePost = catchAsync(async (req, res, next) => {
  const { post_id } = req.body;

 
  const post = await posts.findOne({
    where: { post_id: post_id, original_post_id: null },
    attributes: ['post_status'],
  });

  if (!post) {
    return next(new AppError('Post not found!', 404));
  }

  
  if (post.post_status == '0') {
    return next(new AppError('Post is already active!', 400));
  }

  
  await posts.update(
    { post_status: 0 },
    { where: { post_id: post_id, original_post_id: null} }
  );

  res.status(200).json({
    status: 'success',
    message: 'Post has been hidden successfully!',
  });
});

