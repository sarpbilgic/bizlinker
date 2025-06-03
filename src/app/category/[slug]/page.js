'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  SparklesIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  ViewGridIcon,
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
    fetch(`/api/category/${categorySlug}`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [categorySlug]);

  // Filter and sort products
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
      {/* Hero Section */}
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
              "{categoryTitle}" kategorisinde henüz ürün bulunmamaktadır.
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
            {/* Filters and Controls */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Left side - Filters */}
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

                {/* Right side - View Mode */}
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
                      <ViewGridIcon className="w-4 h-4" />
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

            {/* Products Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className={`group bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-zinc-700 overflow-hidden ${
                    viewMode === 'grid' 
                      ? 'transform hover:-translate-y-2' 
                      : 'flex items-center p-6'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative">
                        <img
                          src={product.image || '/no-image.png'}
                          alt={product.name}
                          className="h-48 w-full object-contain bg-gray-50 dark:bg-zinc-700 p-4"
                        />
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-3 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-2xl font-bold text-green-600">
                            {typeof product.price === 'number' ? `${product.price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {product.businessName || 'Satıcı Bilinmiyor'}
                          </span>
                        </div>
                        
                        <Link
                          href={`/group/${product.group_slug || product.slug}`}
                          className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-center py-3 rounded-xl font-semibold transition duration-200 transform group-hover:scale-105"
                        >
                          Fiyatları Karşılaştır
                        </Link>
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <div className="shrink-0 mr-6">
                        <img
                          src={product.image || '/no-image.png'}
                          alt={product.name}
                          className="w-20 h-20 object-contain bg-gray-50 dark:bg-zinc-700 rounded-lg p-2"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl font-bold text-green-600">
                            {typeof product.price === 'number' ? `${product.price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok'}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {product.businessName || 'Satıcı Bilinmiyor'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        <Link
                          href={`/group/${product.group_slug || product.slug}`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200"
                        >
                          Karşılaştır
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-zinc-700 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Daha Fazla Kategori Keşfet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Diğer kategorilerde de binlerce ürün arasından en uygun fiyatlı olanını bulabilirsiniz.
                </p>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Tüm Kategoriler
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 