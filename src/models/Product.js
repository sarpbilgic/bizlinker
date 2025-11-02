import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true 
  },
  price: { 
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  brand: { 
    type: String,
    trim: true
  },
  image: String,
  productUrl: { 
    type: String, 
    required: [true, 'Product URL is required'], 
    unique: true,
    trim: true
  }, 
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessUrl: {
    type: String,
    trim: true
  }, 
  match_score: {
    type: Number,
    min: 0,
    max: 100
  },
  group_id: { 
    type: String,
    index: true
  },
  group_title: { 
    type: String,
    trim: true
  },
  group_slug: {
    type: String,
    index: true,
    trim: true
  },
  main_category: {
    type: String,
    index: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  category_item: {
    type: String,
    trim: true
  },
  category_slug: {
    type: String,
    index: true,
    trim: true
  },
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
    index: true
  },
  updatedAt: Date,
  priceHistory: [
    {
      price: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
