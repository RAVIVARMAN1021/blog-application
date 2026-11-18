const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
      enum: ['Technology', 'Design', 'Coding', 'Lifestyle', 'Career', 'AI & Data', 'General']
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content']
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    readTime: {
      type: String,
      default: '3 min read'
    },
    featured: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Helper to auto-calculate read time and excerpt if not provided
blogSchema.pre('save', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!this.excerpt) {
      this.excerpt = plainText.length > 150 ? plainText.slice(0, 147) + '...' : plainText;
    }
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / 200) || 1;
    this.readTime = `${minutes} min read`;
  }

  next();
});

module.exports = mongoose.model('Blog', blogSchema);
