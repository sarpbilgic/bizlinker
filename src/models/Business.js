import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  category: String, 
  description: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  services: [
    {
      name: String,
      price: Number,
      description: String,
    },
  ],
});

BusinessSchema.index({ location: "2dsphere" }); // enables $near

export default mongoose.models.Business || mongoose.model("Business", BusinessSchema);
