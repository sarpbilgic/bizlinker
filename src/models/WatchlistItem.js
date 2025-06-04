import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupSlug: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

watchlistItemSchema.index({ user: 1, groupSlug: 1 }, { unique: true });

export default mongoose.models.WatchlistItem || mongoose.model('WatchlistItem', watchlistItemSchema);
