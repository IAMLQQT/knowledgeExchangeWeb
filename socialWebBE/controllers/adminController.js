const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const { user, account, friendship, friendrequest } = require('../models/models');
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

exports.grantAdminPrivileges = catchAsync(async (req, res, next) => {
    try {
      const { accountID } = req.body;
  
      // Tìm tài khoản dựa trên accountID
      const accountInfo = await account.findOne({
        where: { accountID }
      });
  
      // Kiểm tra nếu tài khoản không tồn tại
      if (!accountInfo) {
        return res.status(404).json({ status: 'failed', message: 'Account not found.' });
      }
  
      // Kiểm tra trạng thái tài khoản
      if (accountInfo.account_status !== 'ACTIVE') {
        return res.status(400).json({
          status: 'failed',
          message: `${accountInfo.email} is not active and cannot be granted admin privileges.`
        });
      }
      if (accountInfo.RoleID == '0000000000') {
        return res.status(400).json({
          status: 'failed',
          message: `${accountInfo.email} is already granted admin privileges.`
        });
      }
  
      // Cấp quyền admin cho tài khoản
      await accountInfo.update({
        RoleID: "0000000000" 
      });
      
      res.status(200).json({
        status: 'success',
        message: `${accountInfo.email} has been granted admin privileges successfully.`
      });
  
    } catch (error) {
      // Xử lý lỗi
      console.error('Error granting admin privileges:', error);
      res.status(500).json({
        status: 'failed',
        message: 'An error occurred while granting admin privileges. Please try again later.'
      });
    }
  });

  