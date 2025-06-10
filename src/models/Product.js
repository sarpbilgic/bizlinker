import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  brand: String,
  image: String,
  productUrl: { type: String, required: true, unique: true }, 
  businessName: String,
  businessUrl: String, 
  match_score: Number,
  group_id: { type: String },
  group_title: { type: String },
  main_category: String,
  subcategory: String,
  category_item: String,
  category_slug: String,
  categorized: { type: Boolean, default: false },
  category_ref: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
},
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  },
  
  grouped: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  priceHistory: [
    {
      price: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
