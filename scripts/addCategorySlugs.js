import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import Product from '../src/models/Product.js';

dotenv.config();

async function addCategorySlugs() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu.');

  const products = await Product.find();
  let updated = 0;

  for (const p of products) {
    const item = p.category_item || '';
    const slug = slugify(item, { lower: true });

    const result = await Product.updateOne(
      { _id: p._id },
      { $set: { category_slug: slug } }
    );

    if (result.matchedCount > 0) updated++;
  }

  console.log(`✅ ${updated} ürün için category_slug güncellendi (yeni veya aynı).`);
  await mongoose.disconnect();
}

addCategorySlugs();
