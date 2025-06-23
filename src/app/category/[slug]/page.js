'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
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
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import WatchlistButton from '@/components/WatchlistButton';

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

const ProductCard = ({ product, viewMode }) => {
  const savingsPercent = Math.round(((product.maxPrice - product.minPrice) / product.maxPrice) * 100);
  const averagePrice = product.avgPrice;
  const priceVariance = product.maxPrice - product.minPrice;

  return (
    <motion.div
      variants={slideUp}
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
            %{savingsPercent} Fark
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
            {product.brands.map((brand, idx) => (
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
              <div className="text-gray-500 dark:text-gray-400">En Düşük</div>
              <div className="font-medium text-green-600">{product.minPrice?.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Ortalama</div>
              <div className="font-medium text-blue-600">{Math.round(product.avgPrice)?.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">En Yüksek</div>
              <div className="font-medium text-red-600">{product.maxPrice?.toLocaleString('tr-TR')} ₺</div>
            </div>
          </div>
        </div>

        {/* Business Listings */}
        <div className="space-y-2 mb-4">
          {product.businesses.slice(0, 3).map((store, idx) => (
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
                    En Uygun
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
          {product.businesses.length > 3 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              +{product.businesses.length - 3} diğer satıcı
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
              {product.totalProducts} satıcı
            </div>
          </div>
          <Link
            href={`/product/${product.group_slug}`}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group-hover:shadow-lg"
          >
            <ChartBarIcon className="w-4 h-4" />
            Karşılaştır
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
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

  // Fetch category products with SWR
  const { data: productsData, error: productsError } = useSWR(
    `/api/grouped-products?category_slug=${encodeURIComponent(params.slug)}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  // Fetch available filters
  const { data: filtersData } = useSWR(
    `/api/grouped-products?category_slug=${encodeURIComponent(params.slug)}`,
    fetcher
  );

  const loading = !productsData && !productsError;
  const products = productsData?.data || [];
  
  // Calculate filter options from products data
  const filterOptions = useMemo(() => {
    if (!products.length) return {
      brands: [],
      businesses: [],
      priceRange: { min: DEFAULT_PRICE_RANGE[0], max: DEFAULT_PRICE_RANGE[1] }
    };

    const brands = [...new Set(products.flatMap(p => p.brands || []).filter(Boolean))];
    const businesses = [...new Set(products.flatMap(p => p.businesses?.map(b => b.businessName) || []).filter(Boolean))];
    const prices = products.map(p => p.minPrice).filter(Boolean);
    
    return {
      brands,
      businesses,
      priceRange: {
        min: prices.length ? Math.min(...prices) : DEFAULT_PRICE_RANGE[0],
        max: prices.length ? Math.max(...prices) : DEFAULT_PRICE_RANGE[1]
      }
    };
  }, [products]);

  // Initialize filters once when data is loaded
  useEffect(() => {
    if (!isInitialized && products.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max]
      }));
      setIsInitialized(true);
    }
  }, [isInitialized, products, filterOptions]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  // Computed values
  const categoryTitle = useMemo(() => {
    return params.slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Kategori';
  }, [params.slug]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter(product => {
      // Price filter
      if (product.minPrice < filters.priceRange[0] || product.minPrice > filters.priceRange[1]) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !product.brands.some(brand => filters.brands.includes(brand))) {
        return false;
      }

      // Business filter
      if (filters.businesses.length > 0 && !product.businesses?.some(b => filters.businesses.includes(b.businessName))) {
        return false;
      }

      // Distance filter (if user location is available)
      if (userLocation && product.businesses?.some(b => b.location)) {
        const distances = product.businesses
          .filter(b => b.location)
          .map(b => calculateDistance(
            userLocation.lat,
            userLocation.lng,
            b.location.coordinates[1],
            b.location.coordinates[0]
          ));
        
        const minDistance = Math.min(...distances);
        if (minDistance > filters.distance) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.minPrice - b.minPrice;
        case 'price_desc':
          return b.minPrice - a.minPrice;
        case 'name_asc':
          return a.group_title.localeCompare(b.group_title);
        case 'name_desc':
          return b.group_title.localeCompare(a.group_title);
        case 'savings_desc':
          return (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice);
        case 'stores_desc':
          return b.totalProducts - a.totalProducts;
        default:
      return 0;
      }
    });
  }, [products, filters, sortBy, userLocation]);

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Enhanced Category Header */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="relative max-w-7xl mx-auto px-4 py-12"
        >
          <div className="text-center">
            <motion.div 
              variants={slideUp}
              className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mb-4"
            >
              <TagIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Kategori</span>
            </motion.div>
            <motion.h1 
              variants={slideUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {categoryTitle}
              </span>
            </motion.h1>
            <motion.div 
              variants={slideUp}
              className="flex flex-wrap justify-center gap-4 text-sm"
            >
            {!loading && products.length > 0 && (
                <>
                  <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-semibold">
                        En düşük: {Math.min(...products.map(p => p.minPrice || p.best_offer?.price || Infinity)).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                  </div>
                  <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600 font-semibold">{filterOptions.businesses.length} firma</span>
                    </div>
                  </div>
                  <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBagIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600 font-semibold">{products.length} ürün</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters */}
          <motion.div 
            initial="initial"
            animate="animate"
            variants={slideUp}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="sticky top-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Filtreler</h2>
                </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline transition-colors"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Price Range Filter */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <TagIcon className="w-4 h-4 text-orange-600" />
                    </span>
                    Fiyat Aralığı
                  </h3>
                  <div className="px-2 pt-2">
                    <Slider
                      range
                      min={filterOptions.priceRange.min}
                      max={filterOptions.priceRange.max}
                      value={filters.priceRange}
                      onChange={value => {
                        if (Array.isArray(value) && value.length === 2) {
                          handleFilterChange('priceRange', value);
                        }
                      }}
                      className="mb-6"
                      railStyle={{ backgroundColor: '#E5E7EB' }}
                      trackStyle={[{ backgroundColor: '#F97316' }]}
                      handleStyle={[
                        { backgroundColor: '#fff', borderColor: '#F97316', boxShadow: '0 0 0 2px #FED7AA' },
                        { backgroundColor: '#fff', borderColor: '#F97316', boxShadow: '0 0 0 2px #FED7AA' }
                      ]}
                    />
                    <div className="flex items-center justify-between">
                      <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {filters.priceRange[0]?.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                      <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {filters.priceRange[1]?.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
          </div>
        </div>
      </div>

                {/* Distance Filter */}
                {userLocation && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-blue-600" />
                      </span>
                      Uzaklık
                    </h3>
                    <div className="px-2 pt-2">
                      <Slider
                        min={1}
                        max={100}
                        value={filters.distance}
                        onChange={value => {
                          if (typeof value === 'number') {
                            handleFilterChange('distance', value);
                          }
                        }}
                        className="mb-4"
                        railStyle={{ backgroundColor: '#E5E7EB' }}
                        trackStyle={{ backgroundColor: '#2563EB' }}
                        handleStyle={{ backgroundColor: '#fff', borderColor: '#2563EB', boxShadow: '0 0 0 2px #BFDBFE' }}
                      />
                      <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg px-3 py-1 inline-block">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {filters.distance} km içinde
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand Filter */}
                {filterOptions.brands.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-purple-600" />
                      </span>
                      Markalar
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                      {filterOptions.brands.map(brand => (
                        <label key={brand} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={(e) => {
                              const newBrands = e.target.checked
                                ? [...filters.brands, brand]
                                : filters.brands.filter(b => b !== brand);
                              handleFilterChange('brands', newBrands);
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                        </label>
                      ))}
          </div>
            </div>
                )}

                {/* Business Filter */}
                {filterOptions.businesses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-4 h-4 text-green-600" />
                      </span>
                      Firmalar
            </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                      {filterOptions.businesses.map(business => (
                        <label key={business} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.businesses.includes(business)}
                            onChange={(e) => {
                              const newBusinesses = e.target.checked
                                ? [...filters.businesses, business]
                                : filters.businesses.filter(b => b !== business);
                              handleFilterChange('businesses', newBusinesses);
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{business}</span>
                        </label>
                      ))}
          </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="flex-1"
          >
            {/* Enhanced Sort Controls */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border-gray-300 dark:border-zinc-600 text-sm focus:ring-orange-500 focus:border-orange-500 bg-transparent"
                  >
                    <option value="price_asc">En Düşük Fiyat</option>
                    <option value="price_desc">En Yüksek Fiyat</option>
                    <option value="savings_desc">En Çok Fiyat Farkı</option>
                    <option value="stores_desc">En Çok Satıcı</option>
                    <option value="name_asc">İsim (A-Z)</option>
                    <option value="name_desc">İsim (Z-A)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                        ? 'bg-white dark:bg-zinc-600 text-orange-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-orange-600'
                      }`}
                    >
                    <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                        viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-600 text-orange-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-orange-600'
                      }`}
                    >
                    <ListBulletIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>

            {/* Product List */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                  className="flex items-center justify-center py-12"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900 rounded-full animate-spin border-t-orange-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TagIcon className="w-6 h-6 text-orange-500 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                  className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700"
                >
                  <div className="bg-gray-100 dark:bg-zinc-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FunnelIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ürün Bulunamadı</h3>
                  <p className="text-gray-600 dark:text-gray-400">Filtreleri değiştirerek tekrar deneyin.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="products"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
