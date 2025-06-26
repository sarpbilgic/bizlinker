'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from './WatchlistButton';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const savingsPercent = Math.round(((product.maxPrice - product.minPrice) / product.maxPrice) * 100);
  const averagePrice = product.avgPrice;
  const priceVariance = product.maxPrice - product.minPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-xl transition-all ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img
          src={product.image || '/no-image.png'}
          alt={product.group_title}
          className="w-full h-48 object-contain bg-gray-50 dark:bg-zinc-900 p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {savingsPercent > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            %{savingsPercent} Difference
          </div>
        )}
        <div className="absolute top-2 left-2">
          <WatchlistButton 
            product={{
              id: product._id,
              name: product.group_title,
              image: product.image,
              price: product.minPrice,
              group_slug: product.group_slug,
              businessName: product.businesses?.[0]?.businessName
            }}
            size="small"
          />
        </div>
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.group_title}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-wrap gap-1">
            {product.brands?.map((brand, idx) => (
              <span 
                key={idx}
                className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Price Statistics */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Lowest</div>
              <div className="font-medium text-green-600">{product.minPrice?.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Average</div>
              <div className="font-medium text-blue-600">{Math.round(product.avgPrice)?.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Highest</div>
              <div className="font-medium text-red-600">{product.maxPrice?.toLocaleString('tr-TR')} ₺</div>
            </div>
          </div>
        </div>

        {/* Business Listings */}
        <div className="space-y-2 mb-4">
          {product.businesses?.slice(0, 3).map((store, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors ${
                store.price === product.minPrice
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30'
                  : 'bg-gray-50 dark:bg-zinc-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  store.price === product.minPrice
                    ? 'text-green-700 dark:text-green-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {store.businessName}
                </span>
                {store.price === product.minPrice && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded-full">
                    Most Affordable
                  </span>
                )}
              </div>
              <span className={`font-medium ${
                store.price === product.minPrice
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {store.price?.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          ))}
          {product.businesses?.length > 3 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              +{product.businesses.length - 3} Other Seller
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {product.minPrice?.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {product.businesses?.length} Seller
            </div>
          </div>
          <Link
            href={`/group/${product.group_slug}`}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group-hover:shadow-lg"
          >
            <ChartBarIcon className="w-4 h-4" />
            Compare
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 