import { restrictTo } from './authMiddleware.js';

export const adminOnly = restrictTo('super-admin', 'admin');
export const contentManager = restrictTo('super-admin', 'admin', 'editor');
