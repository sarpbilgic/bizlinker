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
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from '@/components/WatchlistButton';
import ProductImage from '@/components/ProductImage';
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

const DEFAULT_IMAGE = '/no-image.png';

export default function GroupPageClient({ initialData, slug }) {
  const [data] = useState(initialData);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleImageError = (businessName) => {
    setImageErrors(prev => ({
      ...prev,
      [businessName]: true
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Sticky Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHeaderSticky 
          ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg shadow-lg transform translate-y-0' 
          : 'transform -translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-md">
            {data.group_title}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-green-600">
              {data.minPrice.toLocaleString('tr-TR')} ₺
            </span>
            <WatchlistButton 
              product={{
                id: data.group_id,
                name: data.group_title,
                image: data.image,
                price: data.minPrice,
                group_slug: data.group_slug,
                businessName: data.best_offer.businessName
              }}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 p-8">
              <ProductImage
                src={data.image}
                alt={data.group_title}
                priority
              />
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mb-6">
                  <StarIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Price Comparison</span>
                </div>
                
                <div className="flex items-start gap-4">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {data.group_title}
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
              </div>

              {/* Product Features */}
              {data.group_features?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.group_features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* Best Price Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <TrophyIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Best Price</h3>
                    <p className="text-3xl font-bold text-green-600">{data.minPrice.toLocaleString('tr-TR')} ₺</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BuildingStorefrontIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{data.best_offer.businessName}</span>
                    </div>
                  </div>
                </div>
                {data.best_offer.productUrl && (
                  <a
                    href={data.best_offer.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Visit Best Price Store
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mt-12">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Range</h3>
                  <p className="text-2xl font-bold text-blue-600">{(data.maxPrice - data.minPrice).toLocaleString('tr-TR')} ₺</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Potential savings</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <BuildingStorefrontIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Stores</h3>
                  <p className="text-2xl font-bold text-orange-600">{data.businesses.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stores compared</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price History</h3>
                  <p className="text-2xl font-bold text-purple-600">{data.priceHistory.length} days</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Historical data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-4 mt-12 border-b border-gray-200 dark:border-zinc-700">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 font-medium transition-all relative ${
                selectedTab === 'overview'
                  ? 'text-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Overview
              {selectedTab === 'overview' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSelectedTab('stores')}
              className={`px-6 py-3 font-medium transition-all relative ${
                selectedTab === 'stores'
                  ? 'text-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Stores
              {selectedTab === 'stores' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`px-6 py-3 font-medium transition-all relative ${
                selectedTab === 'history'
                  ? 'text-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Price History
              {selectedTab === 'history' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Price Comparison Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Price Comparison</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                {data.businesses.map((business, index) => (
                  <div key={`${business.businessName}-${index}`} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative w-16 h-16 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                          <ProductImage
                            src={business.image}
                            alt={business.name}
                          />
                        </div>
                        <div className="min-w-0">
                          {business.productUrl ? (
                            <a
                              href={business.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2"
                            >
                              {business.name}
                            </a>
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-white line-clamp-2">
                              {business.name}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {business.businessName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {business.price.toLocaleString('tr-TR')} ₺
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {business.price === data.minPrice ? (
                            <span className="text-green-600 flex items-center gap-1 justify-end">
                              <ArrowTrendingDownIcon className="w-4 h-4" />
                              Best Price
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              +{(business.price - data.minPrice).toLocaleString('tr-TR')} ₺
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Price History</h3>
              <div className="h-[400px]">
                <Chart data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'stores' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.businesses.map((business, index) => (
              <div key={index} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                    <BuildingStorefrontIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{business.businessName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {business.distance ? `${business.distance.toFixed(1)} km away` : 'Distance not available'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-600 dark:text-gray-400">Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {business.price.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-600 dark:text-gray-400">vs. Best Price</span>
                    <span className={business.price === data.minPrice ? 'text-green-600' : 'text-gray-900 dark:text-white'}>
                      {business.price === data.minPrice ? 'Best Price' : `+${(business.price - data.minPrice).toLocaleString('tr-TR')} ₺`}
                    </span>
                  </div>
                  {business.productUrl && (
                    <a
                      href={business.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Visit Store
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Price History</h3>
            <div className="h-[600px]">
              <Chart data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 