import express from 'express';
import {
  changePassword,
  createAdmin,
  getMe,
  listAdmins,
  login,
  logout,
  updateProfile,
} from '../controllers/authController.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/validate', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/admins', protect, adminOnly, listAdmins);
router.post('/admins', protect, restrictTo('super-admin'), createAdmin);

export default router;
