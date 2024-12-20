/* eslint-disable camelcase */

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const axios = require('axios');
const { nanoid } = require('nanoid');
const sendEmail = require('../utils/email');
const { user, account } = require('../models/models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');
const { gt } = Sequelize.Op;
const signToken = (id, passwordVersion, ...info) =>
  jwt.sign({ id, passwordVersion, ...info }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
});
function generateRandomPassword(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const passwordArray = new Array(length);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(characters.length);
    passwordArray[i] = characters.charAt(randomIndex);
  }

  return passwordArray.join('');
}
exports.optionalProtect = catchAsync(async (req, res, next) => {
  let token;

  // Lấy token từ header authorization nếu có
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log("Token found:", token);
  }

  if (token) {
    try {
      // Giải mã token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const accountID = decoded.id;

      // Tìm account từ database
      const currentAccount = await account.findOne({ where: { accountID: accountID } });

      if (currentAccount && currentAccount.account_status !== 1) {
        // Kiểm tra thời gian thay đổi mật khẩu
        const timestamp = currentAccount.passwordChangeAt / 1000;
        if (timestamp <= decoded.iat && decoded.passwordVersion === currentAccount.passwordVersion) {
          const userinfo = await user.findOne({
            where: { accountID: currentAccount.accountID },
          });

          // Gán account vào request
          req.account = currentAccount;
          req.user = userinfo;
          console.log("User authenticated:", req.user);
        }
      }
    } catch (error) {
      console.log("Token invalid or user not authenticated:", error.message);
      // Token không hợp lệ hoặc người dùng không xác thực, nhưng không ngăn chặn xử lý tiếp theo
    }
  }
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Lấy token từ header authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  }
  console.log("token", token);

  // Nếu không có token, trả về lỗi
  if (!token) {
    return next(new AppError('You are not allowed to access this. Please log in', 401));
  }

  // Giải mã token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const accountID = decoded.id;

  // Tìm account từ database
  const currentAccount = await account.findOne({ where: { accountID: accountID } });

  // Nếu không tìm thấy account hoặc account bị khóa, trả về lỗi
  if (!currentAccount || currentAccount.account_status != "ACTIVE") {
    return next(new AppError('Account no longer exists', 401));
  }

  // Kiểm tra thời gian thay đổi mật khẩu
  const timestamp = (currentAccount.passwordChangeAt) / 1000;
  if (
    timestamp > decoded.iat ||
    decoded.passwordVersion !== currentAccount.passwordVersion
  ) { return next(new AppError('User changed password. Please login again', 401)); }
  const userinfo = await user.findOne({
    where: { accountID: currentAccount.accountID },
  });
  // Gán account vào request
  req.account = currentAccount;
  req.user = userinfo,

    console.log("đây là req: ", req.user);
  next();
});

exports.restrictTo =
  (...roles) =>
    (req, res, next) => {
      console.log("dây là roles:", roles[0], " ", req.account.RoleID);
      if (!roles.some(id => id == req.account.RoleID)) {
        return next(
          new AppError('You do not have permission to access this!', 403),
        );
      }
      next();
    };

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const userInfo = await account.findOne({ where: { email: email } });

  if (
    !userInfo ||
    !(await userInfo.checkPassword(password, userInfo.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //check if user is active
  const accountStatusMessages = {
    INACTIVE: "This account is not activated, please check your gmail to verify your account",
    LOCKED: "This account is locked, do you want to unlock the account?",
    DELETED: "This account has been deleted, you cannot use this account to log in.",
    SUSPENDED: "This account has been blocked by admin for 15 days"
  };
  if (accountStatusMessages[userInfo.account_status]) {
    return next(new AppError(accountStatusMessages[userInfo.account_status], 401));
  }
  //if everything ok, send token to client
  const token = signToken(userInfo.accountID, userInfo.passwordVersion, userInfo.RoleID);
  //Seend cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: false,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
    passwordVersion : userInfo.passwordVersion,
    RoleID: userInfo.RoleID
  });
});
exports.googleSignIn = catchAsync(async (req, res, next) => {
  const { tokenId } = req.body;
  try {
    // Verify the Google token with Google API
    const googleResponse = await axios.post(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`
    );

    const { sub, email, given_name, family_name, picture } =
      googleResponse.data;
    // Check if the email already exists in the system
    const existingAccount = await account.findOne({ where: { email: email } });

    if (!existingAccount) {
      // Create verification token and expiration time
      const verificationToken = nanoid(32);
      const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Create an account in the Accounts table with 'inactive' status
      const newAccount = await account.create({
        accountID: sub, // Assuming 'sub' is used as accountID
        email: email,
        account_status: 'inactive',
        RoleID: 'user',
        verificationToken: verificationToken,
        verificationExpires: verificationExpires,
      });
      const newUser = {
        user_id: nanoid(15),
        first_name: given_name,
        last_name: family_name,
        profile_picture: picture,
        accountID: newAccount.accountID, 
      };

      await user.create(newUser);
      // Send verification email with the link containing the verificationToken
      const verificationLink = `${process.env.WEB_DOMAIN}/verifyaccount/${verificationToken}`;
      const message = `Welcome! To activate your account, please verify your email by clicking the following link within 10 minutes:
      
      ${verificationLink} \n\nThank you,\nThe Social Web Team`;

      await sendEmail({
        email: newAccount.email,
        subject: '[PTIT] Verify Your Account',
        message,
      });

      res.status(200).json({ status: 'success', message: 'Verification email sent!' });
    } else {
      return res
        .status(401)
        .json({ status: 'failed', message: 'This email is already in use!' });
    }
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    res.status(401).json({ error: 'Google Sign-In failed' });
  }
});
exports.verifyAccount = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Tìm tài khoản dựa trên verificationToken và kiểm tra thời gian hết hạn
    const accountToVerify = await account.findOne({
      where: { verificationToken: token, verificationExpires: { [Op.gt]: Date.now() } }
    });

    if (!accountToVerify) {
      return res.status(400).json({ status: 'failed', message: 'Invalid or expired verification token.' });
    }

    // Tìm thông tin người dùng dựa trên accountID
    const userInfo = await user.findOne({
      where: { accountID: accountToVerify.accountID },
      attributes: ['first_name', 'last_name']  // Lấy các trường cần thiết
    });

    if (!userInfo) {
      return res.status(400).json({ status: 'failed', message: 'User not found for this account.' });
    }

    try {
      const initialPassword = generateRandomPassword(8);
      const encryptPassword = await bcrypt.hash(initialPassword, 12)
      

      // Cập nhật trạng thái tài khoản thành 'active' và lưu mật khẩu
      await account.update({
        account_status: 'active',
        password: encryptPassword,
        verificationToken: null,
        verificationExpires: null
      }, { where: { accountID: accountToVerify.accountID } });
      const loginLink = `${process.env.WEB_DOMAIN}/login`;
      // Soạn email xác nhận
      const message = `Dear ${userInfo.first_name} ${userInfo.last_name},

      Welcome to our platform! Your account has been successfully created. Please use the following email and password to login: 
      Email: ${accountToVerify.email} 
      Password: ${initialPassword}
      You can login on this link: ${loginLink}
      Please note that this is your initial password, and we highly recommend changing it after logging in for the first time.

      If you have any questions or need further assistance, please feel free to contact our support team.

      Best regards,
      PTIT Student Information Exchange Platform
      `;

      // Gửi email
      await sendEmail({
        email: accountToVerify.email,
        subject: '[PTIT] Welcome to PTIT Social Web - Initial Password',
        message,
      });

      // Xác minh thành công
      res.status(200).json({ status: 'success', message: 'Account verified successfully!' });

    } catch (error) {
      console.error('Error while updating account or sending email:', error);
      res.status(500).json({ status: 'failed', message: 'An error occurred while processing the account.' });
    }
  } catch (error) {
    console.error('Error finding account with verification token:', error);
    res.status(500).json({ status: 'failed', message: 'An error occurred while verifying the token.' });
  }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const Accountinfo = await account.findOne({ where: { email: email } });

  if (!Accountinfo) {
    return next(new AppError('Email address is not  d!', 400));
  }
  const resetToken = Accountinfo.createPasswordResetToken();

  await Accountinfo.save();
  //3 send to email
  const resetURL = `${process.env.WEB_DOMAIN}/resetPassword/${resetToken}`;
  const message = `Dear ${Accountinfo.first_name},\n\nWe received a request to reset your password. If you did not initiate this request, please ignore this email.\n\nTo reset your password, please click on the following link:\n\n${resetURL}\n\nThis link is valid for 10 minutes.\n\nThank you,\nThe Social Web Team`;

  try {
    await sendEmail({
      email: Accountinfo.email,
      subject: '[PTIT] Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    Accountinfo.passwordResetToken = undefined;
    Accountinfo.passwordResetExpries = undefined;
    await Accountinfo.save();

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const Accountinfo = await account.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpries: {
        [gt]: Date.now(),
      },
    },
  });
  if (!Accountinfo) {
    return next(
      new AppError('Invalid token or token has already expired!', 401),
    );
  }
  Accountinfo.password = req.body.password;
  Accountinfo.passwordResetToken = null;
  Accountinfo.passwordResetExpries = null;
  await Accountinfo.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const Accountinfo = await account.findOne({ where: { accountID: req.account.accountID } });
  if (!Accountinfo) return next(new AppError("Can't found this account", 400));
  const check = await Accountinfo.checkPassword(currentPassword, Accountinfo.password);
  if (!check) return next(new AppError('Password is not correct!!!', 401));
  Accountinfo.password = newPassword;
  Accountinfo.passwordChangeAt = Date.now();
  Accountinfo.passwordVersion += 1;
  await Accountinfo.save();
  res.status(200).json({ message: 'password changed successfully' });
});
exports.deactivateUser = catchAsync(async (req, res, next) => {
  const Accountinfo = await account.findOne({
    where: {
      accountID: req.account.accountID,
    },
  });
  console.log(Accountinfo);
  
  if (!Accountinfo) {
    return res.status(404).json({ status: 'failed', message: 'User not found.' });
  }

  if (Accountinfo.account_status === 'BLOCKED') {
    return res.status(400).json({ status: 'failed', message: 'User is already blocked.' });
  }
  await Accountinfo.update({ account_status: 'BLOCKED' });
  res
    .status(200)
    .json({ status: 'success', message: 'Deactive successfully.' });
});

exports.verifyToken = async (token) => {
  if (!token) return null;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const accountID = decoded.id;
  const currentAccount = await account.findOne({ where: { accountID: accountID } });
  const currentUser = await user.findOne(
    {
      where: { accountID: accountID }
    }
  )
  if (!currentAccount || currentAccount.account_status === 0) {
    console.log('fail 1');
    return null;
  }
  const timestamp = currentAccount.passwordChangeAt / 1000;
  if (
    timestamp > decoded.iat ||
    decoded.passwordVersion !== currentAccount.passwordVersion
  ) {
    console.log('fail 2');
    return null;
  }

  return { ...currentAccount.get({ plain: true }), user_id: currentUser.user_id };
};

exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const userInfo = await account.findOne({ where: { email: email } });

  if (
    !userInfo ||
    !(await userInfo.checkPassword(password, userInfo.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //check if user is active
  const allowedRoles = ['admin']; // Các `RoleID` được phép đăng nhập
  if (!allowedRoles.includes(userInfo.RoleID)) {
    return next(new AppError('You do not have permission to access this!', 403));
  }

  const accountStatusMessages = {
    INACTIVE: "This account is not activated, please check your gmail to verify your account",
    LOCKED: "This account is locked, do you want to unlock the account?",
    DELETED: "This account has been deleted, you cannot use this account to log in.",
    SUSPENDED: "This account has been blocked by admin for 15 days"
  };
  if (accountStatusMessages[userInfo.account_status]) {
    return next(new AppError(accountStatusMessages[userInfo.account_status], 401));
  }
  //if everything ok, send token to client
  const token = signToken(userInfo.accountID, userInfo.passwordVersion, userInfo.RoleID);
  //Seend cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: false,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
  });
});