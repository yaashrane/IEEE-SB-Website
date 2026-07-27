import express from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  listAnnouncementsAdmin,
  togglePinAnnouncement,
  updateAnnouncement,
} from '../controllers/announcementController.js';
import { contentManager } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', listAnnouncements);
router.get('/admin', protect, contentManager, listAnnouncementsAdmin);
router.post('/', protect, contentManager, createAnnouncement);
router.patch('/:id/pin', protect, contentManager, togglePinAnnouncement);
router.put('/:id', protect, contentManager, updateAnnouncement);
router.delete('/:id', protect, contentManager, deleteAnnouncement);

export default router;
