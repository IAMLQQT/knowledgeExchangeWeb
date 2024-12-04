const express = require('express');
const moment = require('moment');
const multer = require('multer');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const friendshipController = require('../controllers/friendshipController');
const adminController = require('../controllers/adminController');
const forumController = require('../controllers/forumController');
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
router
    .route('/addForum')
    .post(
        authController.protect,
        authController.restrictTo(['admin']),
        forumController.addForum,
    );
router
    .route('/deletedForum')
    .delete(
        authController.protect,
        authController.restrictTo(['admin']),
        forumController.deletedForum,
    );
router
    .route('/hideForum')
    .patch(
        authController.protect,
        authController.restrictTo(['admin']),
        forumController.hideForum,
    );
router
    .route('/activeForum')
    .patch(
        authController.protect,
        authController.restrictTo(['admin']),
        forumController.activeForum,
    );
router
    .route('/getReportPost')
    .get(
        authController.protect,
        authController.restrictTo(['admin']),
        adminController.getReportPost,
    );
module.exports = router;