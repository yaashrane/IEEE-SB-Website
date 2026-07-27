import express from 'express';
import {
  createContactMessage,
  deleteContactMessage,
  listContactMessages,
  markContactRead,
} from '../controllers/contactController.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createContactMessage);
router.get('/', protect, adminOnly, listContactMessages);
router.patch('/:id/read', protect, adminOnly, markContactRead);
router.delete('/:id', protect, adminOnly, deleteContactMessage);

export default router;
