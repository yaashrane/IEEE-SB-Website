import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helpers.js';
import { verifyToken } from '../config/jwt.js';

const getTokenFromRequest = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return req.cookies?.jwt || null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) throw new ApiError('Please log in to access this resource', 401);

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select('+password');

  if (!user || !user.isActive) {
    throw new ApiError('The user belonging to this token no longer exists', 401);
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw new ApiError('Password was changed recently. Please log in again.', 401);
  }

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user?.isActive) req.user = user;
  } catch {
    req.user = null;
  }

  next();
});

export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError('You do not have permission to perform this action', 403);
  }
  next();
};
