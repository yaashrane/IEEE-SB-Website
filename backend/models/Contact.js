import mongoose from 'mongoose';
import validator from 'validator';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [160, 'Subject cannot exceed 160 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    respondedAt: Date,
    source: {
      type: String,
      default: 'website',
      trim: true,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

contactSchema.index({ name: 'text', email: 'text', subject: 'text', message: 'text' });
contactSchema.index({ isRead: 1, createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
