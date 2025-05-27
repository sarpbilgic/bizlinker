
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = 'bizlinker';

async function exportProducts() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const products = await db.collection('products').find({}).toArray();

    const filePath = path.resolve('products.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

    console.log(`✅ ${products.length} ürün başarıyla dışa aktarıldı: ${filePath}`);
  } catch (error) {
    console.error('❌ Export işlemi başarısız:', error.message);
  } finally {
    await client.close();
  }
}

exportProducts();
