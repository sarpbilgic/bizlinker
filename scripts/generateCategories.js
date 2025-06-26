import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import Product from '../src/models/Product.js';


dotenv.config();

const categorySchema = new mongoose.Schema({
  main: String,
  sub: String,
  item: String,
  slug: { type: String, unique: true },
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function generateCategories() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB bağlandı.');

  const products = await Product.find({
    main_category: { $exists: true },
    subcategory: { $exists: true },
    category_item: { $exists: true },
  });

  const unique = new Map();

  for (const p of products) {
    const slug = slugify(p.category_item, { lower: true });
    if (!unique.has(slug)) {
      unique.set(slug, {
        main: p.main_category,
        sub: p.subcategory,
        item: p.category_item,
        slug,
      });
    }
  }

  const categories = Array.from(unique.values());

  await Category.deleteMany(); 
  await Category.insertMany(categories);

  console.log(`${categories.length} Category added.`);
  await mongoose.disconnect();
}

generateCategories();
