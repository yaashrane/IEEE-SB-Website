import mongoose from 'mongoose';
import validator from 'validator';
import { generateSlug } from '../utils/helpers.js';

const imageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    alt: String,
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [240, 'Short description cannot exceed 240 characters'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true,
      index: true,
    },
    banner: imageSchema,
    registrationLink: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return !value || validator.isURL(value, { require_protocol: true });
        },
        message: 'Registration link must be a valid URL with protocol',
      },
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    endDate: Date,
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      min: 0,
      default: 0,
    },
    registeredCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });
eventSchema.index({ status: 1, date: 1, isFeatured: 1 });

eventSchema.pre('validate', function setSlug(next) {
  if (this.title && !this.slug) this.slug = generateSlug(this.title);
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
