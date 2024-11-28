const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const bookmarkController = require('../controllers/bookmarkController')
const likesController = require('../controllers/likesController')
const forumController = require('../controllers/forumController');
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

router.patch(
  '/hidePost',
  authController.protect,
  postController.hidePost,
);
router.patch(
  '/activePost',
  authController.protect,
  postController.activePost,
);

router.get('/search', postController.searchPost);
router.get(
  '/postdetail/:postId',
  authController.protect,
  postController.getPostDetail,
);
router.post('/addComment', authController.protect, commentsController.addComment);
router.get(
  '/getCommentReplies',
  authController.protect,
  commentsController.getCommentReplies,
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
router.get(
  '/getAllForums',
  forumController.getAllForums,
);
router.post(
  '/createPostToForums',
  authController.protect,
  forumController.createPostToForums,
);
router.get(
  '/getPostForum/:forum_id',
  forumController.getPostForum,
);
router.get(
  '/getForumById/:forum_id',
  forumController.getForumById,
);
module.exports = router;
