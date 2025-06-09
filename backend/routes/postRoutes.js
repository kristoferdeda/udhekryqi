const express = require('express');
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} = require('../controllers/postController');

const { verifyToken, isAdmin } = require('../middleware/auth');

// Public Routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Admin Routes
router.post('/', verifyToken, isAdmin, createPost);
router.put('/:id', verifyToken, isAdmin, updatePost);
router.delete('/:id', verifyToken, isAdmin, deletePost);

router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/comments', verifyToken, addComment);
router.delete('/:postId/comments/:commentId', verifyToken, deleteComment);

module.exports = router;