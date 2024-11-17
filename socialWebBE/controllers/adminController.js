const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const { user, account, friendship, friendrequest, role } = require('../models/models');
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

