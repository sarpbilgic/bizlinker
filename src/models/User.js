import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  userType: String, // business or consumer
});

export default mongoose.models.User || mongoose.model("User", userSchema);
