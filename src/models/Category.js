import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  main: {
    type: String,
    required: true,       
  },
  sub: {
    type: String,         
    default: '',
  },
  item: {
    type: String,
    required: true,       
  },
  slug: {
    type: String,
    required: true,       // Örn: "gaming-laptop"
    unique: true,
  },
  aliases: {
    type: [String],       // Örn: ["oyuncu laptop", "gamer laptop"]
    default: [],
  }
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
