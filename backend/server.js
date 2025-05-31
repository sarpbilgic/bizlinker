import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/products.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB bağlantısı kuruldu.');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server ${process.env.PORT} portunda çalışıyor`);
    });
  })
  .catch(err => console.error('Bağlantı hatası:', err));
