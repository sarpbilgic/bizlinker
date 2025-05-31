import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import fs from 'fs';

dotenv.config();

const data = JSON.parse(fs.readFileSync('./all_products_final.json', 'utf-8'));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB bağlantısı kuruldu. Ürünler yükleniyor...');
    await Product.deleteMany({});
    await Product.insertMany(data);
    console.log('Ürünler başarıyla yüklendi.');
    process.exit();
  })
  .catch(err => {
    console.error('Hata:', err);
    process.exit(1);
  });
