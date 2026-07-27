import Announcement from '../models/Announcement.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  asyncHandler,
  buildSearchFilter,
  getPagination,
  getSort,
  parseBoolean,
  pick,
} from '../utils/helpers.js';

const writableFields = ['title', 'message', 'type', 'status', 'expiresAt'];

const buildAnnouncementQuery = (query, publicOnly = true) => {
  const filter = {
    ...buildSearchFilter(query.search, ['title', 'message']),
  };

  if (publicOnly) {
    filter.status = 'published';
    filter.showOnHomepage = true;
    filter.$or = [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: new Date() } }];
  } else if (query.status) {
    filter.status = query.status;
  }

  if (!publicOnly && query.homepage !== undefined) filter.showOnHomepage = parseBoolean(query.homepage);
  if (query.pinned !== undefined) filter.isPinned = parseBoolean(query.pinned);

  return filter;
};

const announcementPayload = (req) => {
  const payload = pick(req.body, writableFields);
  if (req.body.isPinned !== undefined) payload.isPinned = parseBoolean(req.body.isPinned);
  if (req.body.showOnHomepage !== undefined) payload.showOnHomepage = parseBoolean(req.body.showOnHomepage);
  if (req.body.status === 'published') payload.publishedAt = new Date();
  return payload;
};

export const listAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildAnnouncementQuery(req.query, true);
  const sort = getSort(req.query.sort, { isPinned: -1, createdAt: -1 });

  const [announcements, total] = await Promise.all([
    Announcement.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role'),
    Announcement.countDocuments(filter),
  ]);

  ApiResponse.paginated(
    res,
    'announcements',
    announcements,
    total,
    page,
    limit,
    'Announcements fetched successfully'
  );
});

export const listAnnouncementsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildAnnouncementQuery(req.query, false);
  const sort = getSort(req.query.sort, { createdAt: -1 });

  const [announcements, total] = await Promise.all([
    Announcement.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role'),
    Announcement.countDocuments(filter),
  ]);

  ApiResponse.paginated(
    res,
    'announcements',
    announcements,
    total,
    page,
    limit,
    'Admin announcements fetched successfully'
  );
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const payload = announcementPayload(req);
  payload.createdBy = req.user._id;
  const announcement = await Announcement.create(payload);
  ApiResponse.created(res, { announcement }, 'Announcement created successfully');
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, announcementPayload(req), {
    new: true,
    runValidators: true,
  });

  if (!announcement) throw new ApiError('Announcement not found', 404);
  ApiResponse.success(res, { announcement }, 'Announcement updated successfully');
});

export const togglePinAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError('Announcement not found', 404);

  announcement.isPinned = !announcement.isPinned;
  await announcement.save();

  ApiResponse.success(res, { announcement }, 'Announcement pin status updated successfully');
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError('Announcement not found', 404);

  await announcement.deleteOne();
  ApiResponse.success(res, {}, 'Announcement deleted successfully');
});
