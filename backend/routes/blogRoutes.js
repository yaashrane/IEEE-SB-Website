import express from 'express';
import {
  createBlog,
  deleteBlog,
  getBlog,
  getFeaturedBlogs,
  listBlogs,
  listBlogsAdmin,
  publishBlog,
  updateBlog,
} from '../controllers/blogController.js';
import { contentManager } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', listBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/admin', protect, contentManager, listBlogsAdmin);
router.post('/', protect, contentManager, uploadSingleImage('coverImage'), createBlog);
router.patch('/:id/publish', protect, contentManager, publishBlog);
router.put('/:id', protect, contentManager, uploadSingleImage('coverImage'), updateBlog);
router.delete('/:id', protect, contentManager, deleteBlog);
router.get('/:identifier', getBlog);

export default router;
