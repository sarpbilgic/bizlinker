import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['consumer', 'business'], required: true },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
