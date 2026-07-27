import express from 'express';
import {
  createMember,
  deleteMember,
  getMember,
  listMembers,
  updateMember,
} from '../controllers/memberController.js';
import { contentManager } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', listMembers);
router.get('/:id', getMember);
router.post('/', protect, contentManager, uploadSingleImage('photo'), createMember);
router.put('/:id', protect, contentManager, uploadSingleImage('photo'), updateMember);
router.delete('/:id', protect, contentManager, deleteMember);

export default router;
