import mongoose from 'mongoose';
import { generateSlug } from '../utils/helpers.js';

const imageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    alt: String,
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
      maxlength: [320, 'Excerpt cannot exceed 320 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    coverImage: imageSchema,
    category: {
      type: String,
      required: [true, 'Blog category is required'],
      trim: true,
      index: true,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: Date,
    readingTime: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    authorName: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', category: 'text', tags: 'text' });
blogSchema.index({ status: 1, publishedAt: -1, isFeatured: 1 });

blogSchema.pre('validate', function prepareBlog(next) {
  if (this.title && !this.slug) this.slug = generateSlug(this.title);

  const plainText = String(this.content || '').replace(/<[^>]+>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  this.readingTime = Math.max(1, Math.ceil(words / 220));

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
