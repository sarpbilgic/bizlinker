'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function SubCategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/categories')
      .then(res => {
        const mainCategory = res.data.categories.find(
          cat => cat.main.toLowerCase().replace(/\s+/g, '-') === params.slug
        );
        
        if (mainCategory) {
          const subCategory = mainCategory.subs.find(
            sub => sub.sub.toLowerCase().replace(/\s+/g, '-') === params.sub
          );
          
          setCategory({
            main: mainCategory.main,
            sub: subCategory
          });
        }
        
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [params.slug, params.sub]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900 rounded-full animate-spin border-t-orange-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category || !category.sub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The subcategory you&apos;re looking for doesn&apos;t exist.</p>
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
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link 
              href={`/main-category/${params.slug}`}
              className="hover:text-orange-600"
            >
              {category.main}
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white">{category.sub.sub}</span>
          </nav>

          {/* Header */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{category.sub.sub}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse all products in {category.sub.sub}
            </p>
          </div>

          {/* Category Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.sub.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden group hover:shadow-xl transition-all"
              >
                <Link 
                  href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block p-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                      {item}
                    </h2>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
} 