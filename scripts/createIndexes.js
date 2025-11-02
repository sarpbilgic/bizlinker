import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    console.log('📊 Creating performance indexes...\n');

    // === PRODUCTS COLLECTION INDEXES ===
    console.log('📦 Products Collection:');
    
    // Single field indexes for common queries
    await collection.createIndex({ group_id: 1 });
    console.log('  ✅ group_id');
    
    await collection.createIndex({ category_slug: 1 });
    console.log('  ✅ category_slug');
    
    await collection.createIndex({ group_slug: 1 });
    console.log('  ✅ group_slug');
    
    await collection.createIndex({ price: 1 });
    console.log('  ✅ price');
    
    await collection.createIndex({ businessName: 1 });
    console.log('  ✅ businessName');
    
    await collection.createIndex({ brand: 1 });
    console.log('  ✅ brand');
    
    await collection.createIndex({ main_category: 1 });
    console.log('  ✅ main_category');
    
    await collection.createIndex({ createdAt: -1 });
    console.log('  ✅ createdAt');

    // Compound indexes for optimized queries
    await collection.createIndex({ group_id: 1, price: 1 });
    console.log('  ✅ group_id + price (compound)');
    
    await collection.createIndex({ category_slug: 1, price: 1 });
    console.log('  ✅ category_slug + price (compound)');
    
    await collection.createIndex({ main_category: 1, subcategory: 1, category_item: 1 });
    console.log('  ✅ main_category + subcategory + category_item (compound)');
    
    await collection.createIndex({ businessName: 1, price: 1 });
    console.log('  ✅ businessName + price (compound)');
    
    // Text index for search functionality
    await collection.createIndex({ 
      name: 'text', 
      brand: 'text', 
      group_title: 'text',
      description: 'text'
    });
    console.log('  ✅ Full-text search index');

    // === USERS COLLECTION INDEXES ===
    console.log('\n👤 Users Collection:');
    const usersCollection = db.collection('users');
    
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('  ✅ email (unique)');
    
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('  ✅ createdAt');

    // === WATCHLIST COLLECTION INDEXES ===
    console.log('\n⭐ Watchlist Collection:');
    const watchlistCollection = db.collection('watchlists');
    
    await watchlistCollection.createIndex({ userId: 1 });
    console.log('  ✅ userId');
    
    await watchlistCollection.createIndex({ group_slug: 1 });
    console.log('  ✅ group_slug');
    
    await watchlistCollection.createIndex({ userId: 1, group_slug: 1 }, { unique: true });
    console.log('  ✅ userId + group_slug (unique compound)');

    // === CATEGORIES COLLECTION INDEXES ===
    console.log('\n📂 Categories Collection:');
    const categoriesCollection = db.collection('categories');
    
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
    console.log('  ✅ slug (unique)');
    
    await categoriesCollection.createIndex({ main: 1, sub: 1, item: 1 });
    console.log('  ✅ main + sub + item (compound)');

    console.log('\n✨ All indexes created successfully!\n');
    
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach((idx, i) => {
      console.log(`   ${i + 1}. ${idx.name}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createIndexes();


