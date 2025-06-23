'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartIcon as HeartIconSolid,
  XMarkIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import { 
  HeartIcon as HeartIconOutline,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export default function WatchlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadWatchlist();
  }, [user, router]);

  const loadWatchlist = () => {
    try {
      // localStorage'dan watchlist'i al
      const savedWatchlist = localStorage.getItem(`watchlist_${user?.id}`);
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error('Watchlist yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (productId) => {
    if (!productId) return;
    
    setRemoving(productId);
    try {
      const updatedWatchlist = watchlist.filter(item => item.id !== productId);
      setWatchlist(updatedWatchlist);
      localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(updatedWatchlist));
      
      // Optional: API'ye de gönderebiliriz
      // await fetch('/api/watchlist/remove', {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId })
      // });
    } catch (error) {
      console.error('Ürün watchlist\'ten çıkarılamadı:', error);
    } finally {
      setRemoving(null);
    }
  };

  const clearAllWatchlist = () => {
    if (window.confirm('Tüm favori ürünleri silmek istediğinizden emin misiniz?')) {
      setWatchlist([]);
      localStorage.setItem(`watchlist_${user.id}`, JSON.stringify([]));
    }
  };

  const filteredWatchlist = watchlist.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = watchlist.reduce((sum, item) => sum + (item.price || 0), 0);

  if (!user) {
    return null; // Authentication redirect handling
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                BizLinker
              </span>
            </Link>
            
            <Link 
              href="/profile"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <span className="text-sm">Profil</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 rounded-full px-4 py-2 mb-6">
              <HeartIconSolid className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">Favori Ürünlerim</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Watchlist
              </span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-6">
              Takip ettiğiniz ürünlerin fiyat değişimlerini buradan izleyebilirsiniz
            </p>

            {/* Stats */}
            {watchlist.length > 0 && (
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{watchlist.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Favori Ürün</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalValue.toLocaleString('tr-TR')} ₺</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Değer</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {watchlist.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <HeartIconOutline className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
              Henüz Favori Ürününüz Yok
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-lg mb-8 max-w-md mx-auto">
              Beğendiğiniz ürünleri favorilere ekleyerek fiyat değişimlerini takip edebilirsiniz
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Ürün Ara
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5" />
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Favori ürünlerde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                />
              </div>
              
              {watchlist.length > 0 && (
                <button
                  onClick={clearAllWatchlist}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Tümünü Temizle</span>
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWatchlist.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-zinc-700"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <img 
                      src={item.image || '/no-image.png'} 
                      alt={item.name} 
                      className="w-full h-48 object-contain bg-gray-50 dark:bg-zinc-700 p-4"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        disabled={removing === item.id}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-colors"
                        title="Favorilerden çıkar"
                      >
                        {removing === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <XMarkIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      FAVORİ
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <BuildingStorefrontIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.businessName}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                          <span className="text-2xl font-bold text-green-600">
                            {item.price?.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                        {item.addedDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(item.addedDate).toLocaleDateString('tr-TR')} tarihinde eklendi
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        <span>Siteye Git</span>
                      </a>
                      
                      <Link
                        href={`/search?q=${encodeURIComponent(item.name)}`}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
                        title="Fiyatları karşılaştır"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredWatchlist.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Arama sonucu bulunamadı
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  "{searchTerm}" araması için favori ürünlerinizde eşleşme bulunamadı
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                >
                  Aramayı temizle
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
  