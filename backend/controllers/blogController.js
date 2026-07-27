import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { deleteImage, uploadImage } from '../services/uploadService.js';
import {
  asyncHandler,
  buildSearchFilter,
  createUniqueSlug,
  getPagination,
  getSort,
  normalizeList,
  parseBoolean,
  pick,
} from '../utils/helpers.js';

const writableFields = ['title', 'excerpt', 'content', 'category', 'status', 'authorName'];

const buildBlogQuery = (query, publicOnly = true) => {
  const filter = {
    ...buildSearchFilter(query.search, ['title', 'excerpt', 'content', 'category', 'tags']),
  };

  if (publicOnly) filter.status = 'published';
  if (!publicOnly && query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.featured !== undefined) filter.isFeatured = parseBoolean(query.featured);
  if (query.tag) filter.tags = query.tag;

  return filter;
};

const blogPayload = async (req, existingBlog = null) => {
  const payload = pick(req.body, writableFields);

  if (req.body.tags !== undefined) payload.tags = normalizeList(req.body.tags);
  if (req.body.isFeatured !== undefined) payload.isFeatured = parseBoolean(req.body.isFeatured);
  if (req.body.status === 'published' && existingBlog?.status !== 'published') payload.publishedAt = new Date();
  if (req.body.title && req.body.title !== existingBlog?.title) {
    payload.slug = await createUniqueSlug(Blog, req.body.title, existingBlog?._id);
  }
  if (req.file) {
    payload.coverImage = await uploadImage(req.file, 'blogs');
    if (existingBlog?.coverImage) await deleteImage(existingBlog.coverImage);
  }

  return payload;
};

export const listBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildBlogQuery(req.query, true);
  const sort = getSort(req.query.sort, { publishedAt: -1, createdAt: -1 });

  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort(sort).skip(skip).limit(limit).populate('author', 'name email role'),
    Blog.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'blogs', blogs, total, page, limit, 'Blogs fetched successfully');
});

export const listBlogsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildBlogQuery(req.query, false);
  const sort = getSort(req.query.sort, { createdAt: -1 });

  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort(sort).skip(skip).limit(limit).populate('author', 'name email role'),
    Blog.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'blogs', blogs, total, page, limit, 'Admin blogs fetched successfully');
});

export const getFeaturedBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ status: 'published', isFeatured: true })
    .sort({ publishedAt: -1 })
    .limit(6)
    .populate('author', 'name email role');

  ApiResponse.success(res, { blogs }, 'Featured blogs fetched successfully');
});

export const getBlog = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier;
  const selector = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier };

  const blog = await Blog.findOneAndUpdate(
    { ...selector, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name email role');

  if (!blog) throw new ApiError('Blog not found', 404);
  ApiResponse.success(res, { blog }, 'Blog fetched successfully');
});

export const createBlog = asyncHandler(async (req, res) => {
  const payload = await blogPayload(req);
  payload.author = req.user._id;
  payload.authorName = payload.authorName || req.user.name;

  const blog = await Blog.create(payload);
  ApiResponse.created(res, { blog }, 'Blog created successfully');
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError('Blog not found', 404);

  const payload = await blogPayload(req, blog);
  const updatedBlog = await Blog.findByIdAndUpdate(blog._id, payload, {
    new: true,
    runValidators: true,
  }).populate('author', 'name email role');

  ApiResponse.success(res, { blog: updatedBlog }, 'Blog updated successfully');
});

export const publishBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { status: 'published', publishedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!blog) throw new ApiError('Blog not found', 404);

  ApiResponse.success(res, { blog }, 'Blog published successfully');
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError('Blog not found', 404);

  await deleteImage(blog.coverImage);
  await blog.deleteOne();
  ApiResponse.success(res, {}, 'Blog deleted successfully');
});
