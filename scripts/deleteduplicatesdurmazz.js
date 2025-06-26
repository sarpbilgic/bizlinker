import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

async function removeDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const allProducts = await Product.find({}, { _id: 1, name: 1, price: 1 });

  const seen = new Map(); // key: `${name.toLowerCase()}_${price}`, value: [ObjectId...]
  for (const product of allProducts) {
    const key = `${product.name.toLowerCase()}_${product.price}`;
    if (!seen.has(key)) {
      seen.set(key, [product._id]);
    } else {
      seen.get(key).push(product._id);
    }
  }

  const toDelete = [];
  for (const ids of seen.values()) {
    if (ids.length > 1) {
      ids.sort(); // En eski kalsın
      toDelete.push(...ids.slice(1)); // Diğerlerini sil
    }
  }

  if (toDelete.length > 0) {
    const result = await Product.deleteMany({ _id: { $in: toDelete } });
    console.log(`🗑️ ${result.deletedCount} duplicate product(s) removed.`);
  } else {
    console.log('✅ No duplicates found.');
  }

  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
}

removeDuplicates().catch(console.error);
