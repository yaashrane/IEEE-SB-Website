import Member from '../models/Member.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { deleteImage, uploadImage } from '../services/uploadService.js';
import {
  asyncHandler,
  buildSearchFilter,
  getPagination,
  getSort,
  parseNumber,
  pick,
} from '../utils/helpers.js';

const writableFields = [
  'name',
  'email',
  'ieeeId',
  'designation',
  'department',
  'chapter',
  'linkedin',
  'github',
  'bio',
  'status',
  'joinedAt',
];

const buildMemberQuery = (query) => {
  const filter = {
    ...buildSearchFilter(query.search, ['name', 'designation', 'department', 'chapter', 'bio']),
  };

  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.chapter) filter.chapter = query.chapter;
  if (query.designation) filter.designation = query.designation;

  return filter;
};

const memberPayload = async (req, existingMember = null) => {
  const payload = pick(req.body, writableFields);
  if (req.body.priority !== undefined) payload.priority = parseNumber(req.body.priority, 100);
  if (req.file) {
    payload.photo = await uploadImage(req.file, 'members');
    if (existingMember?.photo) await deleteImage(existingMember.photo);
  }
  return payload;
};

export const listMembers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildMemberQuery(req.query);
  const sort = getSort(req.query.sort, { priority: 1, name: 1 });

  const [members, total] = await Promise.all([
    Member.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role'),
    Member.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'members', members, total, page, limit, 'Members fetched successfully');
});

export const getMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id).populate('createdBy', 'name email role');
  if (!member) throw new ApiError('Member not found', 404);
  ApiResponse.success(res, { member }, 'Member fetched successfully');
});

export const createMember = asyncHandler(async (req, res) => {
  const payload = await memberPayload(req);
  payload.createdBy = req.user._id;
  const member = await Member.create(payload);
  ApiResponse.created(res, { member }, 'Member created successfully');
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) throw new ApiError('Member not found', 404);

  const payload = await memberPayload(req, member);
  const updatedMember = await Member.findByIdAndUpdate(member._id, payload, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { member: updatedMember }, 'Member updated successfully');
});

export const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) throw new ApiError('Member not found', 404);

  await deleteImage(member.photo);
  await member.deleteOne();
  ApiResponse.success(res, {}, 'Member deleted successfully');
});
