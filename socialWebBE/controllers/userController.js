const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const { user, account, friendship, friendrequest } = require('../models/models');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs');
const { Op, Sequelize, where } = require('sequelize');
const { sequelize } = require('../models/models');
const { UserInfo } = require('firebase-admin/auth');
exports.getAllAccounts = catchAsync(async (req, res, next) => {
  const allAccounts = await account.findAll({});
  res.status(200).json({ allAccounts });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await user.findAll({});
  res.status(200).json({ allUsers });
});
exports.getProfile = catchAsync(async (req, res, next) => {
  const AccountID = req.account.accountID;
  const userinfo = await user.findOne({
    where: { accountID: AccountID },
    include: [
      {
        model: account,
        as: 'account',
        attributes: ['email'],
      },
    ],
  });
  if (!userinfo) return next(new AppError('User not found!', 404));
  console.log("đây là :", userinfo);
  const { count } = await friendship.findAndCountAll({
    where: { user_id: userinfo.user_id },
  });

  // Check if the user is following the profile
  const contacts = await friendship.findAll({
    where: { 
      [Op.or]: [
        {user_id: userinfo.user_id},
        {user_friend_id: userinfo.user_id}
      ]
    },
    include: [
      {
        model: user,
        as: 'user_friend',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
      },
      {
        model: user,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
      }
    ],
  });

  // Chỉ include user_id hoặc user_friend_id nếu nó không phải là userinfo.user_id
  const filteredContacts = contacts.map(contact => {
    let includedUser = null;
    if (contact.user_id !== userinfo.user_id) {
      includedUser = contact.user; // Include user
    } else if (contact.user_friend_id !== userinfo.user_id) {
      includedUser = contact.user_friend; // Include user_friend
    }
    return {
      ...contact.get({ plain: true }),
      includedUser,
    };
  });

  const sanitizedUser = {
    ...userinfo.get({ plain: true }), // Convert userinfo to plain object and spread its properties
    friendships: count,
    profile_picture: userinfo.profile_picture || `${req.protocol}://${req.get('host')}/uploads/profile_pictures/user.png`, // Set profile picture with default
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: sanitizedUser,
      contacts: filteredContacts,
    },
  });
});


exports.updateProfile = catchAsync(async (req, res, next) => {
  const { user_id } = req.user;
  const { first_name, last_name, nick_name, bio, location } = req.body;

  const ext = req.file?.mimetype.split('/')[1];
  const fileName = `${user_id}_${Date.now()}.${ext}`;
  if (req.file) {
    const rsImg = await sharp(req.file.buffer)
      .resize({ width: 500, height: 500 })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/profile_pictures/${fileName}`);
    req.file.filename = fileName;
    console.log(rsImg);
  }

  const imageUrl = req.file
    ? `${req.protocol}://${req.get(
      'host',
    )}/uploads/profile_pictures/${fileName}`
    : null;
  // Remove old profile picture if it exists
  const directoryPath = 'uploads/profile_pictures/';
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('An error occurred:', err);
    } else {
      const fileFound = files.find((file) => file.startsWith(user_id));
      if (fileFound && fileFound != fileName) {
        fs.unlink(path.join(directoryPath, fileFound), (err) => {
          if (err) {
            console.error('There was an error:', err);
          } else {
            console.log('File deleted successfully:', fileFound);
          }
        });
      } else {
        console.log('File not found');
      }
    }
  });
  await user.update(
    {
      first_name,
      last_name,
      bio,
      nick_name,
      profile_picture: imageUrl || undefined,
      location,
    },
    {
      where: { user_id },
    },
  );
  res.status(200).json({ message: 'success' });
});

exports.getInfoList = catchAsync(async (req, res, next) => {
  console.log("áđá",req.query.user_ids);
  const user_ids = req.query.user_ids.split(',');
  console.log("ÁĐÂS", user_ids);
  if (!user_ids) return next(new AppError('UserId list was not found!', 400));
  const infoList = await user.findAll({
    where: { user_id: user_ids },
    attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
  });
  res.status(200).json({ message: 'success', data: infoList });
});

exports.searchUser = catchAsync(async (req, res, next) => {
  const name = req.query.name;
  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;

  const offset = (page - 1) * limit;

  const [results, meta] = await sequelize.query(
    `
      SELECT 
        user.user_id,
        user.first_name,
        user.last_name,
        user.profile_picture,
        (
            SELECT COUNT(DISTINCT friendship.user_friend_id)
            FROM friendship
            WHERE friendship.user_id = user.user_id
        ) + (
            SELECT COUNT(DISTINCT friendship.user_id)
            FROM friendship
            WHERE friendship.user_friend_id = user.user_id
        ) AS friendship_count
        FROM 
            user
        WHERE 
            user.first_name LIKE :name OR
            user.last_name LIKE :name  OR
            user.nick_name LIKE :name 
        GROUP BY 
            user.user_id, user.first_name, user.last_name, user.profile_picture
        LIMIT :limit OFFSET :offset;
    `,
    {
      replacements: {
        name: `%${name}%`,
        limit: limit,
        offset: offset,
      },
    },
  );
  if (results.length === 0) {
    return res.status(404).json({ message: 'No users found' });
  }
  const totalResult = await user.count({
    where: {
      [Op.or]: [
        { first_name: { [Op.like]: `%${name}%` } },
        { last_name: { [Op.like]: `%${name}%` } },
        { nick_name: { [Op.like]: `%${name}%` } },
      ],
    },
  });
  const totalPages = Math.ceil(totalResult / limit);

  res
    .status(200)
    .json({ message: 'success', data: results, totalPages: totalPages });
});

exports.getUserSearchProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const userinfo = await user.findOne({
    where: { user_id: userId },
    include: [
      {
        model: account, // Tên model của bảng account
        as: 'account',  // Alias của mối quan hệ đã thiết lập
        attributes: ['email'], // Chỉ lấy trường email
      }
    ],
  });
  if (!userinfo) return next(new AppError('User not found!', 404));
  console.log("đây là :", userinfo);

  // Get the number of friendships
  const { count } = await friendship.findAndCountAll({
    where: { 
      [Op.or]: [
        {user_id: userinfo.user_id},
        {user_friend_id: userinfo.user_id}
      ]
    },
  });

  let contacts = null;
  // Check if the user is following the profile
  const isRequestFriend = await friendrequest.findOne({
    where: {
      user_sent_id: req.user.user_id,
      user_receive_id: userinfo.user_id,
    },
  });
  const isFriendShip = await friendship.findOne({
    where: {
      [Op.or]: [
        {user_id: req.user.user_id},
        {user_friend_id: req.user.user_id}
      ],
      [Op.or]: [
        {user_id: userinfo.user_id},
        {user_friend_id: userinfo.user_id}
      ]
    },
  });

  // Check if the user is requesting their own profile
  if (userinfo.user_id) {
    contacts = await friendship.findAll({
      where: { user_id: userinfo.user_id },
      include: [
        {
          model: user,
          as: 'user_friend',
          attributes: ['user_id', 'first_name', 'last_name', 'profile_picture'],
        },
      ],
    });
  }

  const sanitizedUser = {
    ...userinfo.get({ plain: true }), // Convert userinfo to plain object and spread its properties
    friendships: count,                // Add friendship count
    isRequestFriend: !!isRequestFriend,      // Convert isFriendship to boolean
    isFriendShip: !!isFriendShip,
    profile_picture: userinfo.profile_picture || `${req.protocol}://${req.get('host')}/uploads/profile_pictures/user.png`, // Set profile picture with default
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: sanitizedUser,
      contacts,
    },
  });
});
