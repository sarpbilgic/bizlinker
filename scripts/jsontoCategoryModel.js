import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import slugify from 'slugify';
import Category from '../src/models/Category.js'; // doğru yolu ver!

dotenv.config();

const uri = process.env.MONGO_URI;

await mongoose.connect(uri);
console.log("✅ MongoDB bağlantısı başarılı");

const raw = fs.readFileSync("bizlinker.products.cleaned.v4.fully_optimized.json", "utf-8");
const products = JSON.parse(raw);

// Kategori setini oluştur (tekrarları engelle)
const categorySet = new Set();

for (const p of products) {
  const main = p.main_category?.trim();
  const sub = p.subcategory?.trim();
  const item = p.category_item?.trim();

  if (main && item) {
    categorySet.add(JSON.stringify({ main, sub: sub || '', item }));
  }
}

// Her kategori için slug üretip veritabanına ekle
for (const rawCategory of categorySet) {
  const { main, sub, item } = JSON.parse(rawCategory);
  const slug = slugify(item, { lower: true, strict: true });

  try {
    await Category.updateOne(
      { slug }, // slug üzerinden eşleşme
      {
        $set: {
          main,
          sub,
          item,
          slug,
        },
      },
      { upsert: true }
    );
    console.log(`✔️ Kategori güncellendi/eklendi: ${item}`);
  } catch (err) {
    console.error(`❌ Kategori hatası: ${item} - ${err.message}`);
  }
}

await mongoose.disconnect();
console.log("🎉 Tüm kategoriler entegre edildi.");
