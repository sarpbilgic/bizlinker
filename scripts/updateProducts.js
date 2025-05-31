import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';

// .env dosyasından MONGO_URI çek
dotenv.config();

// === Mongoose Modelini Tanımla ===
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  brand: String,
  image: String,
  productUrl: { type: String, unique: true },
  businessName: String,
  businessUrl: String,
  match_score: Number,
  main_category: String,
  subcategory: String,
  category_item: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// === MongoDB'ye Bağlan ===
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ MongoDB bağlantısı kuruldu.');

// === Eşleştirilmiş Ürünleri Yükle ===
const data = fs.readFileSync('all_products_final.json', 'utf-8');
const updatedProducts = JSON.parse(data);

let updated = 0;
let notFound = [];

for (const p of updatedProducts) {
  const result = await Product.updateOne(
    { productUrl: p.productUrl },
    {
      $set: {
        brand: p.brand,
        match_score: p.match_score,
        main_category: p.main_category,
        subcategory: p.subcategory,
        category_item: p.category_item,
      },
    }
  );

  if (result.matchedCount === 0) {
    notFound.push(p.productUrl);
  } else if (result.modifiedCount > 0) {
    updated++;
  }
}

console.log(`✅ Güncellenen ürün sayısı: ${updated}`);
if (notFound.length > 0) {
  console.log(`❗ Bulunamayan ürün sayısı: ${notFound.length}`);
  console.log(notFound.slice(0, 5)); // ilk 5'ini göster
}

await mongoose.disconnect();
