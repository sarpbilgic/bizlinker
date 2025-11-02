# BizLinker - Price Comparison Platform

A comprehensive price comparison platform for electronics and consumer goods in North Cyprus (TRNC). Compare prices across multiple stores instantly and find the best deals.

## 🚀 Features

- **Real-time Price Comparison** - Compare prices across 8+ electronics stores from North Cyprus
- **Product Grouping** - Smart algorithm groups identical products from different sellers 
- **User Watchlist** - Save favorite products and track price changes
- **Advanced Search** - Filter by category, brand, price range, and business
- **User Authentication** - Secure login/register system with JWT
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support** - Toggle between light and dark themes

## 📋 Project Logic Flow

```
1. Web Scrapers → Collect product data from multiple stores
2. Data Processing → Clean, categorize, and group similar products
3. Database Storage → Store products, users, watchlists in MongoDB
4. API Layer → Serve data through RESTful endpoints
5. Frontend → Display products with comparison features
6. User Interaction → Search, filter, compare, and save favorites
```

### Core Workflow
- **Scrapers** run periodically to update product prices
- **External grouping and categorization system that works with python using vector embeddings and cosine similarity** matches similar products across stores
- **Users** can search, compare, and track products
- **Real-time** price updates ensure accuracy

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3+ (React 19)
- **Styling**: Tailwind CSS 4.1+ with DaisyUI
- **Icons**: Heroicons
- **State Management**: React Context API
- **Data Fetching**: SWR + Axios
- **Authentication**: JWT with HTTP-only cookies
- **UI Components**: Custom component library
- **Charts**: Chart.js with React-Chartjs-2

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schema validation
- **Web Scraping**: Puppeteer 
- **File Processing**: Custom scrapers for each store
- **Caching**: In-memory caching for performance
- **External Grouping and Categorization**: Python with sentence-transformer and cosine similarity


## 🗄️ Database Schema

### Collections
- **Products** - Product information, prices, categories
- **Users** - User accounts, preferences, recently viewed
- **Categories** - Hierarchical category structure
- **Watchlists** - User's favorite products
- **Businesses** - Store information and metadata

### Key Features
- **Indexing** - Optimized queries for fast search
- **Aggregation** - Complex grouping and filtering
- **Relationships** - Linked data across collections

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance
- npm or yarn

### Installation
```bash
# Clone repository
git clone [repository-url]
cd bizlinker-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# Create database indexes
node scripts/createIndexes.js

# Run development server
npm run dev
```

### Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/bizlinker
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

## 📊 Data Sources

The platform aggregates data from major TRNC electronics retailers:
- Durmazz
- Fıstık Bilgisayar
- Kıbrıs Teknoloji
- Teknogold Online
- Iris Mo Store
- Sharaf Store
- TechnoPlus Kıbrıs

## 🔧 Key Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Data Management
node scripts/createIndexes.js        # Set up database indexes
node scripts/updateProducts.js      # Update product database
node scripts/[store]-scraper.js     # Run specific store scraper
```

## 📈 Performance Features

- **Database Indexing** - Optimized queries for 50K+ products
- **Caching** - Reduced API calls with smart caching
- **Pagination** - Efficient data loading (50 items/page)
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Dynamic imports for faster loading

## 🔐 Security Features

- **JWT Authentication** - Secure HTTP-only cookies
- **Input Validation** - Zod schema validation
- **Password Hashing** - bcryptjs with salt rounds
- **CORS Protection** - Configured for production
- **Rate Limiting** - API endpoint protection (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and inquiries, please contact the development team.

---

