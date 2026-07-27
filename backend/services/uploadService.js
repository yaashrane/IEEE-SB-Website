import fs from 'fs/promises';
import path from 'path';
import cloudinary, { hasCloudinaryConfig } from '../config/cloudinary.js';
import { publicUrlForLocalUpload } from '../utils/helpers.js';

const removeLocalFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // The upload still succeeds even if temp cleanup fails.
  }
};

export const uploadImage = async (file, folder = 'general') => {
  if (!file) return null;

  if (!hasCloudinaryConfig) {
    return {
      url: publicUrlForLocalUpload(file),
      publicId: null,
      alt: file.originalname,
      bytes: file.size,
      format: path.extname(file.originalname).replace('.', '').toLowerCase(),
    };
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: `ieee-sb/${folder}`,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  });

  await removeLocalFile(file.path);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    alt: file.originalname,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  };
};

export const deleteImage = async (media) => {
  if (!media) return;

  if (media.publicId && hasCloudinaryConfig) {
    await cloudinary.uploader.destroy(media.publicId);
    return;
  }

  if (media.url?.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'uploads', path.basename(media.url));
    await removeLocalFile(localPath);
  }
};
