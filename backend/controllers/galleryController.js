import Gallery from '../models/Gallery.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { deleteImage, uploadImage } from '../services/uploadService.js';
import {
  asyncHandler,
  buildSearchFilter,
  getPagination,
  getSort,
  normalizeList,
  parseBoolean,
  pick,
} from '../utils/helpers.js';

const buildGalleryQuery = (query) => {
  const filter = {
    ...buildSearchFilter(query.search, ['title', 'description', 'category', 'album', 'tags']),
  };

  if (query.category) filter.category = query.category;
  if (query.album) filter.album = query.album;
  if (query.featured !== undefined) filter.isFeatured = parseBoolean(query.featured);

  return filter;
};

export const listGallery = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildGalleryQuery(req.query);
  const sort = getSort(req.query.sort, { createdAt: -1 });

  const [gallery, total] = await Promise.all([
    Gallery.find(filter).sort(sort).skip(skip).limit(limit).populate('uploadedBy', 'name email role'),
    Gallery.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'gallery', gallery, total, page, limit, 'Gallery fetched successfully');
});

export const uploadGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError('At least one image is required', 400);

  const titles = normalizeList(req.body.titles || req.body.title);
  const tags = normalizeList(req.body.tags);

  const documents = await Promise.all(
    req.files.map(async (file, index) => {
      const image = await uploadImage(file, 'gallery');
      return Gallery.create({
        ...pick(req.body, ['description', 'category', 'album', 'event']),
        title: titles[index] || req.body.title || file.originalname,
        tags,
        isFeatured: parseBoolean(req.body.isFeatured),
        image,
        uploadedBy: req.user._id,
      });
    })
  );

  ApiResponse.created(res, { gallery: documents }, 'Images uploaded successfully');
});

export const updateGalleryImage = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) throw new ApiError('Gallery image not found', 404);

  const payload = pick(req.body, ['title', 'description', 'category', 'album', 'event']);
  if (req.body.tags !== undefined) payload.tags = normalizeList(req.body.tags);
  if (req.body.isFeatured !== undefined) payload.isFeatured = parseBoolean(req.body.isFeatured);
  if (req.file) {
    payload.image = await uploadImage(req.file, 'gallery');
    await deleteImage(item.image);
  }

  const gallery = await Gallery.findByIdAndUpdate(item._id, payload, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { gallery }, 'Gallery image updated successfully');
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) throw new ApiError('Gallery image not found', 404);

  await deleteImage(item.image);
  await item.deleteOne();
  ApiResponse.success(res, {}, 'Gallery image deleted successfully');
});
