'use client';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { 
  TrophyIcon,
  BuildingStorefrontIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  ShoppingCartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from '@/components/WatchlistButton';
import { useEffect, useState } from 'react';

export async function generateMetadata({ params }) {
  return { title: `${decodeURIComponent(params.slug)} | Price Comparison` };
}

export default function GroupPage({ params }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const slug = decodeURIComponent(params.slug);
        const response = await fetch(`/api/grouped-products?group_slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error('Products fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!products?.length) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-gray-100 dark:bg-zinc-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
          Product Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-500 text-lg">
          There are no products available for this group yet.
        </p>
      </div>
    </div>
  );

  const product = products[0];
  const title = product.group_title;

  const getFirmColor = (index) => {
    const colors = [
      'from-emerald-500 to-green-600', // En ucuz - yeşil
      'from-orange-500 to-amber-600',  // Orta - turuncu  
      'from-blue-500 to-indigo-600',   // Pahalı - mavi
      'from-purple-500 to-violet-600', // Daha pahalı - mor
      'from-red-500 to-pink-600'       // En pahalı - kırmızı
    ];
    return colors[index] || colors[colors.length - 1];
  };

  const cheapestPrice = products[0]?.price || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mb-6">
              <StarIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Price Comparison</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                <span className="text-orange-600">{title}</span>
              </h1>
              <WatchlistButton 
                product={{
                  id: product._id,
                  name: product.group_title,
                  image: product.image,
                  price: product.minPrice,
                  group_slug: product.group_slug,
                  businessName: product.businesses?.[0]?.businessName
                }}
                size="large"
              />
            </div>
            
            <span className="text-2xl md:text-3xl bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent block mb-6">
              Price Comparison
            </span>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-6">
              {products.length} best offers from different companies, compare now
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <span className="text-green-600 font-semibold">Cheapest: {cheapestPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <span className="text-blue-600 font-semibold">{products.length} business</span>
              </div>
              {products.length > 1 && (
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-orange-600 font-semibold">
                    Difference: {(products[products.length - 1].price - cheapestPrice).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Comparison */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Price Comparison
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select the best price and complete your purchase.
          </p>
        </div>

        <div className="grid gap-6">
          {products.map((product, index) => {
            const gradientColor = getFirmColor(index);
            const savings = product.price - cheapestPrice;
            const isFirst = index === 0;
            
            return (
              <div 
                key={product._id.toString()} 
                className={`group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                  isFirst 
                    ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                    : 'border-gray-200 dark:border-zinc-700'
                }`}
              >
                {/* Rank Badge */}
                <div className={`absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center shadow-lg z-10`}>
                  {isFirst ? (
                    <TrophyIcon className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  )}
                </div>

                {/* Best Deal Badge */}
                {isFirst && (
                  <div className="absolute -top-2 right-4 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10 transform rotate-3">
                    <StarIcon className="w-4 h-4 inline mr-1" />
                    CHEAPEST
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    {/* Product Image */}
                    <div className="shrink-0 mx-auto lg:mx-0">
                      <div className="w-32 h-32 bg-gray-50 dark:bg-zinc-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-600 p-4">
                        <img 
                          src={product.image || '/no-image.png'} 
                          alt={product.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 text-center lg:text-left">
                      <h3 className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white mb-3 leading-tight">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <BuildingStorefrontIcon className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {product.businessName}
                          </span>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="mb-6">
                        <div className={`text-4xl font-bold mb-2 ${
                          isFirst ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {typeof product.price === 'number' ? `${product.price.toLocaleString('tr-TR')} ₺` : 'No Price'}
                        </div>
                        
                        {savings > 0 && (
                          <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                            {savings.toLocaleString('tr-TR')} ₺ more expensive than the cheapest
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradientColor} hover:scale-105 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg text-lg`}
                      >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        Purchase ({product.businessName})
                      </a>
                    </div>
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-lg">
                Smart Comparison
              </h3>
            </div>
            <p className="text-blue-800 dark:text-blue-300">
              Prices are updated by the businesses.
              For the most up-to-date price information, please visit the business's website.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
