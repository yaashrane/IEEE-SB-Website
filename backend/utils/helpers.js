import slugify from 'slugify';

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const generateSlug = (text) =>
  slugify(String(text || ''), { lower: true, strict: true, trim: true });

export const getPagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getSort = (sortString, defaultSort = { createdAt: -1 }) => {
  if (!sortString) return defaultSort;

  return String(sortString)
    .split(',')
    .filter(Boolean)
    .reduce((sort, field) => {
      const cleanField = field.trim();
      sort[cleanField.startsWith('-') ? cleanField.slice(1) : cleanField] = cleanField.startsWith('-') ? -1 : 1;
      return sort;
    }, {});
};

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm) return {};
  const regex = new RegExp(escapeRegex(searchTerm), 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

export const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const parseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const pick = (source, fields) =>
  fields.reduce((payload, field) => {
    if (source[field] !== undefined) payload[field] = source[field];
    return payload;
  }, {});

export const createUniqueSlug = async (Model, text, ignoredId = null) => {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await Model.exists({
      slug,
      ...(ignoredId ? { _id: { $ne: ignoredId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

export const publicUrlForLocalUpload = (file) =>
  file ? `/uploads/${file.filename || file.path?.split(/[\\/]/).pop()}` : null;
