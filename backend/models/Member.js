import mongoose from 'mongoose';
import validator from 'validator';

const imageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    alt: String,
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator(value) {
          return !value || validator.isEmail(value);
        },
        message: 'Please provide a valid member email',
      },
      sparse: true,
      index: true,
    },
    ieeeId: {
      type: String,
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    chapter: {
      type: String,
      trim: true,
      index: true,
    },
    photo: imageSchema,
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return !value || validator.isURL(value, { require_protocol: true });
        },
        message: 'LinkedIn must be a valid URL with protocol',
      },
    },
    github: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return !value || validator.isURL(value, { require_protocol: true });
        },
        message: 'GitHub must be a valid URL with protocol',
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [600, 'Bio cannot exceed 600 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'alumni'],
      default: 'active',
      index: true,
    },
    priority: {
      type: Number,
      default: 100,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

memberSchema.index({ name: 'text', designation: 'text', department: 'text', chapter: 'text', bio: 'text' });
memberSchema.index({ status: 1, priority: 1, name: 1 });

const Member = mongoose.model('Member', memberSchema);

export default Member;
