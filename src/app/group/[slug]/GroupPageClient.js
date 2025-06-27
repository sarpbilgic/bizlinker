'use client';
import { useState, useEffect } from 'react';
import { 
  TrophyIcon,
  BuildingStorefrontIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from '@/components/WatchlistButton';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dinamik olarak yükle
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

export default function GroupPageClient({ initialData, slug }) {
  const [data] = useState(initialData);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    // Son görüntülenen ürünlere ekle
    const addToRecentlyViewed = async () => {
      try {
        await fetch('/api/user/recently-viewed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: data.group_id })
        });
      } catch (error) {
        console.error('Failed to add to recently viewed:', error);
      }
    };
    addToRecentlyViewed();
  }, [data.group_id]);

  // Fiyat geçmişi grafiği için veri hazırla
  const chartData = {
    labels: data.priceHistory.map(p => p.date),
    datasets: data.businesses.map((business, index) => ({
      label: business.businessName,
      data: data.priceHistory
        .filter(p => p.businessName === business.businessName)
        .map(p => p.price),
      borderColor: `hsl(${(index * 360) / data.businesses.length}, 70%, 50%)`,
      backgroundColor: `hsl(${(index * 360) / data.businesses.length}, 70%, 50%, 0.1)`,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('tr-TR')} ₺`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return value.toLocaleString('tr-TR') + ' ₺';
          }
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mb-6">
              <StarIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Price Comparison</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                <span className="text-orange-600">{data.group_title}</span>
              </h1>
              <WatchlistButton 
                product={{
                  id: data.group_id,
                  name: data.group_title,
                  image: data.image,
                  price: data.minPrice,
                  group_slug: data.group_slug,
                  businessName: data.best_offer.businessName
                }}
                size="large"
              />
            </div>

            {/* Product Features */}
            {data.group_features?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {data.group_features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mt-12">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 mx-auto">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Best Price</h3>
                <p className="text-2xl font-bold text-green-600">{data.minPrice.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  at {data.best_offer.businessName}
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 mx-auto">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Price Range</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {(data.maxPrice - data.minPrice).toLocaleString('tr-TR')} ₺
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Potential savings
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4 mx-auto">
                  <BuildingStorefrontIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Stores</h3>
                <p className="text-2xl font-bold text-orange-600">{data.businesses.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Stores compared
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4 mx-auto">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Price History</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {data.priceHistory.length} days
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Historical data
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-center gap-4 mt-12 border-b border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  selectedTab === 'overview'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('price-history')}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  selectedTab === 'price-history'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Price History
              </button>
              <button
                onClick={() => setSelectedTab('nearby')}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  selectedTab === 'nearby'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Nearby Stores
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {selectedTab === 'overview' && (
          <>
            {/* Price Comparison */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Compare Prices
              </h2>
              <div className="grid gap-6">
                {data.businesses.map((business, index) => {
                  const isFirst = index === 0;
                  const savings = business.price - data.minPrice;
                  const savingsPercent = ((savings / business.price) * 100).toFixed(1);
                  
                  return (
                    <div 
                      key={`${business.businessName}-${index}`}
                      className={`group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                        isFirst 
                          ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                          : 'border-gray-200 dark:border-zinc-700'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className={`absolute -top-3 -left-3 w-12 h-12 ${
                        isFirst ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                        index === 1 ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                        'bg-gradient-to-br from-blue-500 to-indigo-600'
                      } rounded-full flex items-center justify-center shadow-lg z-10`}>
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
                          BEST DEAL
                        </div>
                      )}

                      <div className="p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                          {/* Store Logo/Image */}
                          <div className="shrink-0 mx-auto lg:mx-0">
                            <div className="w-40 h-40 bg-gray-50 dark:bg-zinc-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-600 p-4">
                              {business.image ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={business.image} 
                                    alt={business.businessName}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Store Details */}
                          <div className="flex-1 text-center lg:text-left">
                            {/* Product Name */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                              {business.name || data.group_title}
                            </h3>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                              <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-700 rounded-full px-4 py-2">
                                <BuildingStorefrontIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {business.businessName}
                                </span>
                              </div>
                              {business.brand && (
                                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2">
                                  <TagIcon className="w-5 h-5 text-blue-600" />
                                  <span className="text-blue-700 dark:text-blue-400 font-medium">
                                    {business.brand}
                                  </span>
                                </div>
                              )}
                              {isFirst && (
                                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-4 py-2">
                                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                    Best Price
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Price Section */}
                            <div className="mb-6">
                              <div className={`text-4xl font-bold mb-2 ${
                                isFirst ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                              }`}>
                                {business.price.toLocaleString('tr-TR')} ₺
                              </div>
                              
                              {savings > 0 && (
                                <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  {savings.toLocaleString('tr-TR')} ₺ ({savingsPercent}%) more expensive than the best price
                                </div>
                              )}
                            </div>

                            {/* Action Button */}
                            <a
                              href={business.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 ${
                                isFirst 
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700' 
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                              } hover:scale-105 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg text-lg`}
                            >
                              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                              Go to Store
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related Products */}
            {data.related?.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Similar Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {data.related.map(product => (
                    <Link
                      key={product._id}
                      href={`/group/${product.group_slug}`}
                      className="bg-white dark:bg-zinc-800 rounded-xl p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-zinc-700"
                    >
                      <div className="aspect-square bg-gray-50 dark:bg-zinc-700 rounded-lg mb-4 p-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.group_title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {product.group_title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-600">
                          {product.minPrice.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {product.businessCount} stores
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {selectedTab === 'price-history' && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Price History (Last 30 Days)
            </h2>
            <div className="h-[400px]">
              <Chart data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedTab === 'nearby' && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Nearby Stores
            </h2>
            <div className="grid gap-4">
              {data.nearbyStores.map((store, index) => (
                <div
                  key={store._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <MapPinIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {store._id}
                      </h3>
                      {store.distance && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {store.distance.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {store.price.toLocaleString('tr-TR')} ₺
                    </div>
                    {store.price > data.minPrice && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        +{(store.price - data.minPrice).toLocaleString('tr-TR')} ₺
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Why Compare with Bizlinker?
              </h3>
            </div>
            <p className="text-blue-800 dark:text-blue-200">
              We compare prices from multiple stores to help you find the best deals. 
              Save time and money by comparing prices in one place.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 