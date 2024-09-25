const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const bookmarkController = require('../controllers/bookmarkController')
const likesController = require('../controllers/likesController')
const commentsController = require('../controllers/commentsController')
const router = express.Router();
router.get('/getPosts', postController.getPosts);
router.get(
  '/postdetail/:postId',
  authController.protect,
  postController.getPostDetail,
);
router.get(
  '/postdetailwithouttoken/:postId',
  postController.getPostDetailWithoutToken,
);
router.post('/createPost', authController.protect, postController.createPost);
router.put("/updatePost/:postId",authController.protect,postController.updatePost)
router.delete('/deletePost', authController.protect, postController.deletePost);
router.get('/search', postController.searchPost);
router.post('/addComment', authController.protect, commentsController.addComment);
router.patch(
  '/editComment',
  authController.protect,
  commentsController.editComment,
);
router.delete(
  '/deleteComment',
  authController.protect,
  commentsController.deleteComment,
);
router.post('/likePost', authController.protect, likesController.likePost);
router.delete('/unlikePost', authController.protect, likesController.unlikePost);


router.post('/savePost', authController.protect, bookmarkController.savePost);
router.delete('/unsavePost', authController.protect, bookmarkController.unsavePost);
router.get(
  '/getSavedPosts',
  authController.protect,
  bookmarkController.getSavedPosts,
);
module.exports = router;
