// ✅ src/app/main-category/[slug]/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const brandIcons = {
  apple: StarIcon,
  samsung: SparklesIcon,
  huawei: ChartBarIcon,
  xiaomi: ArrowTrendingUpIcon,
  default: BuildingStorefrontIcon
};

export default function MainCategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [brandStats, setBrandStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularGroups, setPopularGroups] = useState([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch category, products, and brand data in parallel
        const [categoryRes, productsRes, brandsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get(`/api/grouped-by-category?main=${encodeURIComponent(params.slug)}`),
          axios.get(`/api/brands?main_category=${encodeURIComponent(params.slug)}`)
        ]);

        const mainCategory = categoryRes.data.categories.find(
          cat => cat.main.toLowerCase().replace(/\s+/g, '-') === params.slug
        );
        setCategory(mainCategory);

        // Process products data
        const allProducts = productsRes.data || [];
        setProducts(allProducts);

        // Find groups with most sellers
        const allGroups = [];
        allProducts.forEach(section => {
          section.groups.forEach(group => {
            allGroups.push(group);
          });
        });
        
        // Sort by product count and take top 10
        const topGroups = allGroups
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 10);
        
        setPopularGroups(topGroups);

        // Set brand statistics from the brands API
        setBrandStats(brandsRes.data.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  // Get icon for brand
  const getBrandIcon = (brandName) => {
    if (!brandName) return brandIcons.default;
    const key = Object.keys(brandIcons).find(k => 
      brandName.toLowerCase().includes(k)
    ) || 'default';
    return brandIcons[key];
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-white dark:bg-zinc-800 rounded-xl"></div>
            <div className="h-96 bg-white dark:bg-zinc-800 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-64 bg-white dark:bg-zinc-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const displayedBrands = showAllBrands ? brandStats : brandStats.slice(0, 12);

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The category you're looking for doesn't exist.</p>
            <Link href="/" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeIn}
          className="space-y-8"
        >
          {/* Header */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{category?.main}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {category?.main} kategorisinde en popüler ürünleri keşfedin
            </p>
          </div>

          {/* Popular Products Slider */}
          {popularGroups.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    En Çok Satıcısı Olan Ürünler
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll('left')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
              
              <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              >
                {popularGroups.map((group, idx) => (
                  <Link
                    key={idx}
                    href={`/group/${group.slug}`}
                    className="flex-shrink-0 w-[300px] group hover:scale-[1.02] transition-transform"
                  >
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={group.image || '/no-image.png'}
                          alt={group.title}
                          className="object-contain w-full h-full p-4"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-orange-500">
                          {group.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                            <BuildingStorefrontIcon className="w-3 h-3" />
                            {group.productCount} satıcı
                          </span>
                          {group.brand && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium truncate">
                              <SparklesIcon className="w-3 h-3 flex-shrink-0" />
                              {group.brand}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {group.price?.toLocaleString('tr-TR')} ₺
                          </span>
                          {group.maxPrice > group.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {group.maxPrice?.toLocaleString('tr-TR')} ₺
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Subcategories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category?.subs.map((sub, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden group hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <Link 
                    href={`/main-category/${params.slug}/${sub.sub.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block mb-4"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                      {sub.sub}
                    </h2>
                  </Link>
                  <ul className="space-y-2">
                    {sub.items.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-center text-gray-600 dark:text-gray-400">
                        <ChevronRightIcon className="w-4 h-4 mr-2 text-orange-500" />
                        <Link 
                          href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="hover:text-orange-600 hover:underline"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                    {sub.items.length > 5 && (
                      <li className="text-sm text-orange-500 mt-2">
                        +{sub.items.length - 5} more categories
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Brand Grid */}
          {brandStats.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BuildingStorefrontIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Markalar
                  </h2>
                </div>
                {brandStats.length > 12 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
                  >
                    {showAllBrands ? (
                      <>
                        Daha Az Göster
                        <ChevronUpIcon className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Tümünü Gör
                        <ChevronDownIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {displayedBrands.map((brand, idx) => {
                  const IconComponent = getBrandIcon(brand.name);
                  return (
                    <Link
                      key={idx}
                      href={`/search?brand=${encodeURIComponent(brand.name)}&main_category=${encodeURIComponent(params.slug)}`}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 rounded-lg px-4 py-3 group hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <IconComponent className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-orange-600">
                          {brand.name}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {brand.count} ürün
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
