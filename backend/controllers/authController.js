import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { setAuthCookie, signToken } from '../config/jwt.js';
import { asyncHandler, parseBoolean, pick } from '../utils/helpers.js';

const safeUser = (user) => (user.toSafeObject ? user.toSafeObject() : user.toObject());

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new ApiError('This admin account is inactive', 403);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setAuthCookie(res, token, parseBoolean(req.body.remember, true));

  ApiResponse.success(res, { token, user: safeUser(user) }, 'Logged in successfully');
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  ApiResponse.success(res, {}, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { user: safeUser(req.user) }, 'Session is valid');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = pick(req.body, ['name', 'email']);
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError('Current password and new password are required', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  const token = signToken(user);
  setAuthCookie(res, token, true);

  ApiResponse.success(res, { token, user: safeUser(user) }, 'Password changed successfully');
});

export const createAdmin = asyncHandler(async (req, res) => {
  const payload = pick(req.body, ['name', 'email', 'password', 'role']);
  const user = await User.create(payload);
  ApiResponse.created(res, { user: safeUser(user) }, 'Admin user created successfully');
});

export const listAdmins = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  ApiResponse.success(res, { users }, 'Admin users fetched successfully');
});
