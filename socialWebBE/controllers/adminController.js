const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const { user, account, friendship, friendrequest, role, posts, likes, tags } = require('../models/models');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs');
const { Op, Sequelize, where } = require('sequelize');
const { sequelize } = require('../models/models');
const { UserInfo } = require('firebase-admin/auth');
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const allUsers = await user.findAll({});
    res.status(200).json({ allUsers });
});

exports.getAllAccounts = catchAsync(async (req, res, next) => {
    const allAccounts = await account.findAll({});
    res.status(200).json({ allAccounts });
});
exports.getAllUserAccounts = catchAsync(async (req, res, next) => {
  const allUserAccounts = await user.findAll({
      include: {
          model: account,
          as: "account",
          attributes: ['accountID', 'email', 'account_status', "RoleID"], 
      },
      attributes: ['user_id', 'first_name', 'last_name', 'accountID', 'profile_picture', 'bio', 'nick_name'], // Các trường bạn muốn lấy từ bảng user
  });

  res.status(200).json({ allUserAccounts });
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { accountID, newStatus } = req.body;

  const accountInfo = await account.findOne({
    where: { accountID }
  });
  if (!accountInfo) {
    return res.status(404).json({ status: 'failed', message: 'Account not found.' });
  }

  // Kiểm tra trạng thái hợp lệ
  const validStatuses = ['INACTIVE', 'ACTIVE', 'LOCKED', 'DELETED', 'SUSPENDED'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ status: 'failed', message: 'Invalid status.' });
  }

  // Xử lý trạng thái 'SUSPENDED'
  if (newStatus === 'SUSPENDED') {
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + 15);
  
    await accountInfo.update({
      account_status: newStatus,
      suspendedUntil: suspendUntil.getTime()
    });
    
    return res.status(200).json({
        status: 'success',
        message: `User ${accountID} suspended successfully and will be released on ${suspendUntil}.`
    });
  }
  await accountInfo.update({
    account_status: newStatus,
    suspendedUntil: null 
  });

  res.status(200).json({
    status: 'success',
    message: `User status updated to ${newStatus} successfully.`
  });
});


exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { accountID, newRoleID } = req.body;

  // Lấy thông tin tài khoản từ accountID
  const accountInfo = await account.findOne({
    where: { accountID },
    include: {
      model: role,
      as: "Role",
    },
  });
  console.log("đay là " , accountInfo);
  
  if (!accountInfo) {
    return res.status(404).json({ status: 'failed', message: 'Account not found.' });
  }

  // Kiểm tra trạng thái tài khoản có phải là "ACTIVE" không
  if (accountInfo.account_status !== 'ACTIVE') {
    return res.status(403).json({
      status: 'failed',
      message: 'Only accounts with ACTIVE status can update roles.',
    });
  }
  
  // Cập nhật RoleID của tài khoản
  await account.update(
    { RoleID: newRoleID },
    { where: { accountID } }
  );

  res.status(200).json({
    status: 'success',
    message: `User role updated to ${accountInfo.RoleID} successfully.`,
  });
});

exports.getPostsManagement = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const post_status = parseInt(req.query.post_status) ;
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
    where: { original_post_id: null,  post_status: post_status},
    attributes: ['title', 'created_at', 'post_id', 'post_status', 'hiddenBy'],
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