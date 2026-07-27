import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Image title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Image URL is required'],
      },
      publicId: String,
      alt: String,
      width: Number,
      height: Number,
      bytes: Number,
      format: String,
    },
    category: {
      type: String,
      required: [true, 'Gallery category is required'],
      trim: true,
      index: true,
    },
    album: {
      type: String,
      trim: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

gallerySchema.index({ title: 'text', description: 'text', category: 'text', album: 'text', tags: 'text' });
gallerySchema.index({ category: 1, createdAt: -1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
