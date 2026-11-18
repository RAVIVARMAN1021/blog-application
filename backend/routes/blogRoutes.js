const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  getUserBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Public route to get all published blogs
router.get('/', getBlogs);

// Protected route to get user's own blogs (Drafts + Published)
// Placed before /:id so "user/my-blogs" is not matched as an ObjectId
router.get('/user/my-blogs', protect, getUserBlogs);

// Public route to get single blog by ID
router.get('/:id', getBlogById);

// Protected routes to create, update, delete
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

// Public interaction route
router.patch('/:id/like', toggleLikeBlog);

module.exports = router;
