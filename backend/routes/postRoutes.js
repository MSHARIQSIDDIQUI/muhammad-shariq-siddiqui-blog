const express = require('express');
const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getFrontPage,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPosts);
router.get('/front-page', getFrontPage);
router.get('/mine', protect, getMyPosts);
router.get('/:slug', getPostBySlug);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
