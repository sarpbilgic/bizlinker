"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  SparklesIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  GridViewIcon
} from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load categories');
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('bilgisayar') || name.includes('computer')) return CpuChipIcon;
    if (name.includes('telefon') || name.includes('mobile')) return DevicePhoneMobileIcon;
    if (name.includes('ev') || name.includes('home')) return HomeIcon;
    if (name.includes('moda') || name.includes('fashion')) return ShoppingBagIcon;
    return SparklesIcon;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-6 py-3 mb-6 border border-orange-200 dark:border-orange-800">
            <TagIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">All Categories</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Explore Categories
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {categories.length} Find the most affordable option among thousands of products in different categories
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <span className="text-orange-600 font-semibold">📱 Electronic</span>
            </div>
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <span className="text-blue-600 font-semibold">💻 Computer</span>
            </div>
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <span className="text-green-600 font-semibold">🏠 Home & Living</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading categories...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Popular Categories
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Compare prices in the most preferred categories
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categories.map((cat, index) => {
                const IconComponent = getCategoryIcon(cat.title);
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-zinc-700 overflow-hidden"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative flex flex-col items-center text-center">
                      {/* Icon Container */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-2">
                        {cat.title}
                      </h3>
                      
                      {/* Product Count */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Explore Products
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                          <span>Explore</span>
                          <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Category Index */}
                    <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500/10 dark:bg-orange-600/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {index + 1}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-zinc-700 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Can&apos;t Find the Category You&apos;re Looking For?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You can find the product you&apos;re looking for and compare prices by searching on the homepage.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Return to Homepage
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 