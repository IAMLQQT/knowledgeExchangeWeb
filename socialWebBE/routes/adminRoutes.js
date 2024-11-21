const express = require('express');
const moment = require('moment');
const multer = require('multer');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const friendshipController = require('../controllers/friendshipController');
const adminController = require('../controllers/adminController');
const router = express.Router();
router.post('/login', authController.adminLogin);
router
    .route('/getAllAccounts')
    .get(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.getAllAccounts,
    );
router
    .route('/getAllUsers')
    .get(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.getAllUsers,
    );
router
    .route('/getAllUserAccounts')
    .get(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.getAllUserAccounts,
    );
router
    .route('/updateUserStatus')
    .patch(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.updateUserStatus,
    );
router
    .route('/updateUserRole')
    .patch(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.updateUserRole,
    );
router
    .route('/getPostsManagement')
    .get(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.getPostsManagement,
    );

module.exports = router;