import mongoose, { Schema } from 'mongoose';

const WatchlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    group_slug: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);