'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  TagIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon, 
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import ProductCard from '@/components/ProductCard';

const fetcher = url => axios.get(url).then(res => res.data);

const DEFAULT_PRICE_RANGE = [0, 100000];

// Framer Motion variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('price_asc');
  const [filters, setFilters] = useState({
    priceRange: DEFAULT_PRICE_RANGE,
    distance: 50,
    brands: [],
    businesses: [],
    features: {}
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch search results with SWR
  const { data: searchData, error: searchError } = useSWR(
    query ? `/api/search?query=${encodeURIComponent(query)}&min=${filters.priceRange[0]}&max=${filters.priceRange[1]}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const loading = !searchData && !searchError;
  const products = searchData?.data || [];

  // Calculate filter options from products data
  const filterOptions = useMemo(() => {
    if (!products.length) return {
      brands: [],
      businesses: [],
      features: {}
    };

    const options = {
      brands: [...new Set(products.flatMap(p => p.brands || []))],
      businesses: [...new Set(products.flatMap(p => p.businesses?.map(b => b.businessName) || []))],
      features: {}
    };

    // Extract unique features
    products.forEach(product => {
      if (product.group_features) {
        Object.entries(product.group_features).forEach(([key, value]) => {
          if (!options.features[key]) {
            options.features[key] = new Set();
          }
          options.features[key].add(value);
        });
      }
    });

    // Convert Sets to Arrays
    Object.keys(options.features).forEach(key => {
      options.features[key] = Array.from(options.features[key]);
    });

    return options;
  }, [products]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Price filter
      const [minPrice, maxPrice] = filters.priceRange;
      if (product.minPrice < minPrice || product.maxPrice > maxPrice) return false;

      // Brand filter
      if (filters.brands.length > 0) {
        const productBrands = product.brands || [];
        if (!filters.brands.some(brand => productBrands.includes(brand))) return false;
      }

      // Business filter
      if (filters.businesses.length > 0) {
        const productBusinesses = product.businesses?.map(b => b.businessName) || [];
        if (!filters.businesses.some(business => productBusinesses.includes(business))) return false;
      }

      // Feature filters
      for (const [feature, value] of Object.entries(filters.features)) {
        if (value && product.group_features?.[feature] !== value) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.minPrice - b.minPrice;
        case 'price_desc':
          return b.minPrice - a.minPrice;
        case 'name_asc':
          return a.group_title.localeCompare(b.group_title);
        case 'name_desc':
          return b.group_title.localeCompare(a.group_title);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: DEFAULT_PRICE_RANGE,
      distance: 50,
      brands: [],
      businesses: [],
      features: {}
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mb-6">
              <MagnifyingGlassIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Arama Sonuçları</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="text-orange-600">{query}</span> için
              <br />
              <span className="text-2xl md:text-3xl bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {filteredProducts.length} ürün bulundu
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-4 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-orange-500" />
                  Filtreler
            </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Temizle
                </button>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Fiyat Aralığı
                </label>
                <Slider
                  range
                  min={0}
                  max={100000}
                  value={filters.priceRange}
                  onChange={value => handleFilterChange('priceRange', value)}
                  className="mb-2"
                />
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{filters.priceRange[0].toLocaleString('tr-TR')} ₺</span>
                  <span>{filters.priceRange[1].toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Brand Filter */}
              {filterOptions.brands.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Markalar
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.brands.map(brand => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => {
                            const newBrands = filters.brands.includes(brand)
                              ? filters.brands.filter(b => b !== brand)
                              : [...filters.brands, brand];
                            handleFilterChange('brands', newBrands);
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Filter */}
              {filterOptions.businesses.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Satıcılar
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.businesses.map(business => (
                      <label key={business} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.businesses.includes(business)}
                          onChange={() => {
                            const newBusinesses = filters.businesses.includes(business)
                              ? filters.businesses.filter(b => b !== business)
                              : [...filters.businesses, business];
                            handleFilterChange('businesses', newBusinesses);
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{business}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Filters */}
              {Object.entries(filterOptions.features).map(([feature, values]) => (
                <div key={feature} className="mb-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {feature}
                  </label>
                  <select
                    value={filters.features[feature] || ''}
                    onChange={(e) => {
                      const newFeatures = {
                        ...filters.features,
                        [feature]: e.target.value || null
                      };
                      handleFilterChange('features', newFeatures);
                    }}
                    className="w-full rounded-lg border-gray-300 text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-zinc-700 dark:border-zinc-600"
                  >
                    <option value="">Tümü</option>
                    {values.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border-gray-300 text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-zinc-700 dark:border-zinc-600"
                  >
                    <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
                    <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
                    <option value="name_asc">İsim (A → Z)</option>
                    <option value="name_desc">İsim (Z → A)</option>
              </select>

              <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
              </div>
            </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} ürün gösteriliyor
                </div>
          </div>
        </div>

            {/* Products */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Ürünler yükleniyor...</p>
          </div>
            ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
              Sonuç Bulunamadı
            </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Farklı filtreler deneyerek arama yapmayı deneyin
            </p>
          </div>
        ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                <AnimatePresence>
                  {sortedProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={slideUp}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 