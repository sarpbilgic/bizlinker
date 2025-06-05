'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  SparklesIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon, // ViewGridIcon yerine düzeltildi
  ListBulletIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('price');
  const [filterBusiness, setFilterBusiness] = useState('all');
  
  const categorySlug = params.slug;
  const categoryTitle = categorySlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Kategori';

  useEffect(() => {
    if (!categorySlug) return;
    
    setLoading(true);
    fetch(`/api/grouped-products?category_slug=${encodeURIComponent(categorySlug)}`)
      .then(res => {
        if (!res.ok) throw new Error('Category fetch failed');
        return res.json();
      })
      .then(body => {
        const data = Array.isArray(body.data) ? body.data : [];
        // data alanı varsa kullan, yoksa doğrudan gelen değeri kullan
        setProducts(data.length ? data : Array.isArray(body) ? body : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [categorySlug]);

  const filteredProducts = products
    .filter(product => filterBusiness === 'all' || product.businessName === filterBusiness)
    .sort((a, b) => {
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'business') return (a.businessName || '').localeCompare(b.businessName || '');
      return 0;
    });

  const businesses = [...new Set(products.map(p => p.businessName).filter(Boolean))];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-6 py-3 mb-6 border border-orange-200 dark:border-orange-800">
              <TagIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Kategori</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {categoryTitle}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {loading ? 'Ürünler yükleniyor...' : `${filteredProducts.length} ürün bulundu`}
            </p>
            {!loading && products.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-green-600 font-semibold">
                    En ucuz: {Math.min(...products.map(p => p.price || Infinity)).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-blue-600 font-semibold">{businesses.length} firma</span>
                </div>
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-orange-600 font-semibold">Fiyat karşılaştırması</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Kategoriye ait ürünler yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <TagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
              Bu Kategoride Ürün Bulunamadı
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-lg mb-6">
              {categoryTitle} kategorisinde henüz ürün bulunmamaktadır.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
            >
              <SparklesIcon className="w-5 h-5" />
              Diğer Kategoriler
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtreler:</span>
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="price">Fiyata Göre</option>
                    <option value="name">İsme Göre</option>
                    <option value="business">Firmaya Göre</option>
                  </select>

                  <select
                    value={filterBusiness}
                    onChange={(e) => setFilterBusiness(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Tüm Firmalar</option>
                    {businesses.map(business => (
                      <option key={business} value={business}>{business}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Görünüm:</span>
                  <div className="flex bg-gray-100 dark:bg-zinc-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-orange-500'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-orange-500'
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* ... ürün listesi burada devam ediyor ... */}
          </>
        )}
      </div>
    </main>
  );
}
