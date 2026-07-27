import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      trim: true,
      maxlength: [1500, 'Message cannot exceed 1500 characters'],
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'urgent'],
      default: 'info',
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    showOnHomepage: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    publishedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

announcementSchema.index({ title: 'text', message: 'text' });
announcementSchema.index({ status: 1, showOnHomepage: 1, isPinned: -1, createdAt: -1 });

announcementSchema.pre('validate', function setPublishedAt(next) {
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
