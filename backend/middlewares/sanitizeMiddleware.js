export const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((safe, [key, nestedValue]) => {
      safe[key] = sanitizeValue(nestedValue);
      return safe;
    }, {});
  }

  return value;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
};

export default sanitizeRequest;
