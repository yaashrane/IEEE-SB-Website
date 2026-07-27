import express from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  getFeaturedEvents,
  listEvents,
  listEventsAdmin,
  updateEvent,
} from '../controllers/eventController.js';
import { contentManager } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', listEvents);
router.get('/featured', getFeaturedEvents);
router.get('/admin', protect, contentManager, listEventsAdmin);
router.post('/', protect, contentManager, uploadSingleImage('banner'), createEvent);
router.put('/:id', protect, contentManager, uploadSingleImage('banner'), updateEvent);
router.delete('/:id', protect, contentManager, deleteEvent);
router.get('/:identifier', getEvent);

export default router;
