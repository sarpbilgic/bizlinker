import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGO_URI;

await mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("✅ MongoDB bağlantısı başarılı");

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

const raw = fs.readFileSync("bizlinker.products.cleaned.v4.fully_optimized.json", "utf-8");
const products = JSON.parse(raw);

const operations = [];

for (const p of products) {
  try {
    const rawId = p._id?.$oid || p._id;
    if (!rawId) throw new Error("Eksik _id");

    const objectId = new mongoose.Types.ObjectId(rawId);

    // Eğer tüm güncellenecek alanlar mevcutsa ekle
    if (p.main_category && p.subcategory && p.category_item && p.brand) {
      operations.push({
        updateOne: {
          filter: { _id: objectId },
          update: {
            $set: {
              main_category: p.main_category,
              subcategory: p.subcategory,
              category_item: p.category_item,
              brand: p.brand,
            },
          },
          upsert: false,
        },
      });
    }
  } catch (err) {
    console.error(`⚠️ Atlandı: ${p.name || "isimsiz ürün"} - ${err.message}`);
  }
}

// Eğer güncellenecek işlem varsa gönder
if (operations.length > 0) {
  try {
    const result = await Product.bulkWrite(operations);
    console.log(`🎯 Güncellenen kayıt sayısı: ${result.modifiedCount}`);
  } catch (err) {
    console.error("❌ Bulk update hatası:", err.message);
  }
} else {
  console.log("⛔ Uygun ürün bulunamadı veya eksik veri vardı.");
}

await mongoose.disconnect();
console.log("🎉 İşlem tamamlandı.");
