import mongoose from 'mongoose';
import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { deleteImage, uploadImage } from '../services/uploadService.js';
import {
  asyncHandler,
  buildSearchFilter,
  createUniqueSlug,
  getPagination,
  getSort,
  normalizeList,
  parseBoolean,
  parseNumber,
  pick,
} from '../utils/helpers.js';

const writableFields = [
  'title',
  'description',
  'shortDescription',
  'category',
  'registrationLink',
  'location',
  'date',
  'endDate',
  'time',
  'status',
];

const buildEventQuery = (query, publicOnly = true) => {
  const filter = {
    ...buildSearchFilter(query.search, ['title', 'description', 'category', 'location', 'tags']),
  };

  if (publicOnly) filter.status = 'published';
  if (!publicOnly && query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.featured !== undefined) filter.isFeatured = parseBoolean(query.featured);
  if (query.upcoming !== undefined && parseBoolean(query.upcoming)) {
    filter.date = { $gte: new Date() };
    if (!filter.status) filter.status = 'published';
  }

  return filter;
};

const eventPayload = async (req, existingEvent = null) => {
  const payload = pick(req.body, writableFields);

  if (req.body.tags !== undefined) payload.tags = normalizeList(req.body.tags);
  if (req.body.isFeatured !== undefined) payload.isFeatured = parseBoolean(req.body.isFeatured);
  if (req.body.capacity !== undefined) payload.capacity = parseNumber(req.body.capacity);
  if (req.body.registeredCount !== undefined) payload.registeredCount = parseNumber(req.body.registeredCount);
  if (req.body.title && req.body.title !== existingEvent?.title) {
    payload.slug = await createUniqueSlug(Event, req.body.title, existingEvent?._id);
  }
  if (req.file) {
    payload.banner = await uploadImage(req.file, 'events');
    if (existingEvent?.banner) await deleteImage(existingEvent.banner);
  }

  return payload;
};

export const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildEventQuery(req.query, true);
  const sort = getSort(req.query.sort, { date: 1, createdAt: -1 });

  const [events, total] = await Promise.all([
    Event.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role'),
    Event.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'events', events, total, page, limit, 'Events fetched successfully');
});

export const listEventsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildEventQuery(req.query, false);
  const sort = getSort(req.query.sort, { createdAt: -1 });

  const [events, total] = await Promise.all([
    Event.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role'),
    Event.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'events', events, total, page, limit, 'Admin events fetched successfully');
});

export const getFeaturedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'published', isFeatured: true }).sort({ date: 1 }).limit(6);
  ApiResponse.success(res, { events }, 'Featured events fetched successfully');
});

export const getEvent = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier;
  const selector = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier };
  const event = await Event.findOne({ ...selector, status: 'published' }).populate('createdBy', 'name email role');

  if (!event) throw new ApiError('Event not found', 404);
  ApiResponse.success(res, { event }, 'Event fetched successfully');
});

export const createEvent = asyncHandler(async (req, res) => {
  const payload = await eventPayload(req);
  payload.createdBy = req.user._id;
  const event = await Event.create(payload);
  ApiResponse.created(res, { event }, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError('Event not found', 404);

  const payload = await eventPayload(req, event);
  const updatedEvent = await Event.findByIdAndUpdate(event._id, payload, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { event: updatedEvent }, 'Event updated successfully');
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError('Event not found', 404);

  await deleteImage(event.banner);
  await event.deleteOne();
  ApiResponse.success(res, {}, 'Event deleted successfully');
});
