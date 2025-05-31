import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: String,
  image: String,
  productUrl: String,
  businessName: String,
  main_category: String,
  subcategory: String,
  category_item: String
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
