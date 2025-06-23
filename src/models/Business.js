import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  website: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

businessSchema.index({ location: '2dsphere' });

export default mongoose.models.Business || mongoose.model('Business', businessSchema);
