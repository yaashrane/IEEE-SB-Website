import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ApiError from '../utils/ApiError.js';
import { sanitizeValue } from './sanitizeMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDir);
  },
  filename(req, file, callback) {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/-+/g, '-');
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }
  callback(new ApiError('Only image uploads are allowed', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE || 5 * 1024 * 1024),
  },
});

const sanitizeAfterUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (error) => {
    if (error) return next(error);
    if (req.body) req.body = sanitizeValue(req.body);
    next();
  });
};

export const uploadSingleImage = (fieldName) => sanitizeAfterUpload(upload.single(fieldName));
export const uploadMultipleImages = (fieldName, maxCount = 10) =>
  sanitizeAfterUpload(upload.array(fieldName, maxCount));
export default upload;
