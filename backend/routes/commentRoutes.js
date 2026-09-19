const express = require('express');
const { getCommentsForPost, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/post/:postId', getCommentsForPost);
router.post('/post/:postId', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
