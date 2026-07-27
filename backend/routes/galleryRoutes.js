import express from 'express';
import {
  deleteGalleryImage,
  listGallery,
  updateGalleryImage,
  uploadGalleryImages,
} from '../controllers/galleryController.js';
import { contentManager } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadMultipleImages, uploadSingleImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', listGallery);
router.post('/', protect, contentManager, uploadMultipleImages('images', 20), uploadGalleryImages);
router.put('/:id', protect, contentManager, uploadSingleImage('image'), updateGalleryImage);
router.delete('/:id', protect, contentManager, deleteGalleryImage);

export default router;
