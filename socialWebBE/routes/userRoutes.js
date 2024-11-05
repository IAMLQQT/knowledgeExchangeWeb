const express = require('express');
const moment = require('moment');
const multer = require('multer');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const friendshipController = require('../controllers/friendshipController');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/login', authController.login);
router.route('/googleSignIn').post(authController.googleSignIn);
router.post('/verifyaccount/:token', authController.verifyAccount);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);
router.patch(
  '/deactivateAccount',
  authController.protect,
  authController.deactivateUser,
);
router
  .route('/getAllAccounts')
  .get(
    authController.protect,
    authController.restrictTo(['0000000000']),
    adminController.getAllAccounts,
  );
router
  .route('/updateUserStatus')
  .patch(
    authController.protect,
    authController.restrictTo(['0000000000']),
    adminController.updateUserStatus,
  );
router 
  .route('/getAllUsers')
  .get(
    authController.protect,
    authController.restrictTo(['0000000000']),
    adminController.getAllUsers,
  );
router 
  .route('/grantAdminPrivileges')
  .patch(
    authController.protect,
    authController.restrictTo(['0000000000']),
    adminController.grantAdminPrivileges,
  );
router.get(
  '/getProfile/:id?',
  authController.protect,
  usersController.getProfile,
);
router.get(
  '/getUserSearchProfile/:id?',
  authController.protect,
  usersController.getUserSearchProfile,
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post(
  '/updateProfile',
  authController.protect,
  upload.single('profile_picture'),
  usersController.updateProfile,
);
router.post('/unfriend', authController.protect, friendshipController.unFriends);
router.get('/getInfoList', authController.protect, usersController.getInfoList);
router.get(
  '/search',
  usersController.searchUser,
);
router.post('/addfriendrequest', authController.protect, friendshipController.addFriendRequest)
router.post('/acceptFriendRequest', authController.protect, friendshipController.acceptFriendrequest);
router.get('/getfriendrequest', authController.protect, friendshipController.getFriendRequest)
router.post('/declidefriendrequest', authController.protect, friendshipController.declideFriendRequest)
module.exports = router;
