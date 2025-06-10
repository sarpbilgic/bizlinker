'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      const res = await fetch('/api/user/recently-viewed');
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch recently viewed products:', error);
      setError('Son bakılan ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-20 w-20 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Son Bakılan Ürünler
        </h3>
        <div className="text-center text-gray-600 dark:text-gray-400 py-8">
          Henüz hiç ürün görüntülememişsiniz
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <ClockIcon className="w-5 h-5" />
        Son Bakılan Ürünler
      </h3>
      <div className="space-y-4">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product.group_id}`}
            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <div className="relative w-20 h-20 bg-white dark:bg-zinc-800 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {product.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {product.businessName}
              </p>
              <p className="text-sm font-medium text-orange-600">
                {product.price} TL
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 