const Blog = require('../models/Blog');

/**
 * @desc    Get all published blogs (with optional search and category filters)
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'published' };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search filter across title, excerpt, and content (sanitizing special regex characters)
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching blogs'
    });
  }
};

/**
 * @desc    Get single blog post by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'author',
      'name email avatar role'
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment views count atomically
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    return res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching blog'
    });
  }
};

/**
 * @desc    Get all blogs authored by the logged-in user (Published + Drafts)
 * @route   GET /api/blogs/user/my-blogs
 * @access  Private
 */
const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user blogs'
    });
  }
};

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private
 */
const createBlog = async (req, res) => {
  try {
    const { title, content, category, image, excerpt, status } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a blog title'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide blog content'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Please select a blog category'
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      category,
      image: image && image.trim() ? image.trim() : undefined,
      excerpt: excerpt && excerpt.trim() ? excerpt.trim() : undefined,
      status: status === 'draft' ? 'draft' : 'published',
      author: req.user._id
    });

    const populatedBlog = await Blog.findById(blog._id).populate(
      'author',
      'name email avatar role'
    );

    return res.status(201).json({
      success: true,
      message: blog.status === 'published' ? 'Blog post published successfully!' : 'Blog post saved as draft.',
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating blog'
    });
  }
};

/**
 * @desc    Update an existing blog post
 * @route   PUT /api/blogs/:id
 * @access  Private
 */
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Security check: Only the author can update their post
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this blog'
      });
    }

    const { title, content, category, image, excerpt, status } = req.body;

    if (title && title.trim()) blog.title = title.trim();
    if (content && content.trim()) blog.content = content.trim();
    if (category) blog.category = category;
    if (image !== undefined && image.trim()) blog.image = image.trim();
    if (excerpt !== undefined) blog.excerpt = excerpt.trim();
    if (status) blog.status = status;

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id).populate(
      'author',
      'name email avatar role'
    );

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating blog'
    });
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private
 */
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Security check: Only the author can delete their post
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this blog'
      });
    }

    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting blog'
    });
  }
};

/**
 * @desc    Toggle like for a blog post
 * @route   PATCH /api/blogs/:id/like
 * @access  Public
 */
const toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const { increment } = req.body;
    if (increment === false) {
      blog.likes = Math.max(0, (blog.likes || 1) - 1);
    } else {
      blog.likes = (blog.likes || 0) + 1;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      likes: blog.likes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  getUserBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog
};
