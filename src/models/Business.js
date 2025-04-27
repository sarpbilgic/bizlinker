import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  name: String,
  services: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
});

BusinessSchema.index({ location: '2dsphere' });

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);