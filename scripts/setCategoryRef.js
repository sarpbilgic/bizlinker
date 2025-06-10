import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

console.log("🔁 Kategori referansları atanıyor...");

// Sadece category_ref alanı boş olan ürünleri al
const products = await Product.find({
  category_ref: { $exists: false },
  category_slug: { $ne: null }
});

let count = 0;

for (const product of products) {
  try {
    // 📆 createdAt/updatedAt alanlarını düzelt
    if (product.createdAt?.$date) {
      product.createdAt = new Date(product.createdAt.$date);
    }
    if (product.updatedAt?.$date) {
      product.updatedAt = new Date(product.updatedAt.$date);
    }

    // 🔍 Kategoriyi slug ile bul
    const category = await Category.findOne({ slug: product.category_slug });

    if (category) {
      product.category_ref = category._id;
      await product.save();
      count++;
      console.log(`✔️ Eşleşti: ${product.name}`);
    } else {
      console.warn(`⚠️ Kategori bulunamadı: ${product.category_slug}`);
    }
  } catch (err) {
    console.error(`❌ Hata: ${product.name} - ${err.message}`);
  }
}

await mongoose.disconnect();
console.log(`🎉 ${count} ürün başarıyla eşlendi.`);
