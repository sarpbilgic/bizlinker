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

const raw = fs.readFileSync("bizlinker.products.json", "utf-8");
const products = JSON.parse(raw);

for (const p of products) {
  const id = p._id.$oid;
  p._id = new mongoose.Types.ObjectId(id);
  await Product.replaceOne({ _id: p._id }, p, { upsert: true });
  console.log(`✔️ Güncellendi/Eklendi: ${p.name}`);
}

await mongoose.disconnect();
console.log("🎉 İşlem tamamlandı.");
