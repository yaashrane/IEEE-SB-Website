import Contact from '../models/Contact.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendContactNotification } from '../services/emailService.js';
import { asyncHandler, buildSearchFilter, getPagination, getSort, parseBoolean, pick } from '../utils/helpers.js';

const buildContactQuery = (query) => {
  const filter = {
    ...buildSearchFilter(query.search, ['name', 'email', 'subject', 'message']),
  };

  if (query.read !== undefined) filter.isRead = parseBoolean(query.read);
  return filter;
};

export const createContactMessage = asyncHandler(async (req, res) => {
  const payload = pick(req.body, ['name', 'email', 'phone', 'subject', 'message', 'source']);
  payload.ipAddress = req.ip;
  payload.userAgent = req.get('user-agent');

  const contact = await Contact.create(payload);
  await sendContactNotification(contact);

  ApiResponse.created(res, { contact }, 'Message submitted successfully');
});

export const listContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildContactQuery(req.query);
  const sort = getSort(req.query.sort, { createdAt: -1 });

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort(sort).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'contacts', contacts, total, page, limit, 'Contact messages fetched successfully');
});

export const markContactRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true, respondedAt: parseBoolean(req.body.responded, false) ? new Date() : undefined },
    { new: true, runValidators: true }
  );

  if (!contact) throw new ApiError('Contact message not found', 404);
  ApiResponse.success(res, { contact }, 'Contact message marked as read');
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new ApiError('Contact message not found', 404);

  await contact.deleteOne();
  ApiResponse.success(res, {}, 'Contact message deleted successfully');
});
