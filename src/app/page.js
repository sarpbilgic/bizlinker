'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  StarIcon,
  ShoppingBagIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from '@/components/WatchlistButton';

const fetcher = url => axios.get(url).then(res => res.data);

export default function HomePage() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [visibleSections, setVisibleSections] = useState(3);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 50000 });
  const [recentSearches, setRecentSearches] = useState([]);

  const loaderRef = useRef();
  const searchInputRef = useRef();

  // Use SWR for stats to keep them fresh
  const { data: statsData } = useSWR('/api/stats', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true
  });

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  const filteredSections = sections
    .map(section => ({
      ...section,
      groups: section.groups
        .filter(g => (g.title || '').toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
          if (b.savingsPercent !== a.savingsPercent) {
            return b.savingsPercent - a.savingsPercent;
          }
          return a.price - b.price;
        })
    }))
    .filter(section => section.groups.length > 0);

  const loadMore = useCallback(() => {
    if (!loading && filteredSections.length > visibleSections) {
      setVisibleSections((prev) => prev + 3);
    }
  }, [loading, filteredSections.length, visibleSections]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && !loading) {
      loadMore();
    }
  }, [loadMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    // Load recent searches from localStorage
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(searches);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionRes, categoriesRes] = await Promise.all([
          axios.get(`/api/grouped-by-category?limit=30&minPrice=${priceFilter.min}&maxPrice=${priceFilter.max}`),
          axios.get('/api/categories')
        ]);

        setSections(sectionRes.data);
        setCategories(Array.isArray(categoriesRes.data.categories) ? categoriesRes.data.categories : []);
      } catch (error) {
        console.error('Veri alınırken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          axios.post('/api/location-log', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }).catch(() => {});
        },
        (error) => {
          console.warn('Konum alınamadı:', error);
        }
      );
    }
  }, [priceFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Save to recent searches
      const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const newSearches = [search, ...searches.filter(s => s !== search)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      setRecentSearches(newSearches);
      
      window.location.href = `/search?q=${encodeURIComponent(search)}`;
    }
  };

  const slugify = (text) => text?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || '';

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('bilgisayar')) return CpuChipIcon;
    if (name.includes('telefon')) return DevicePhoneMobileIcon;
    if (name.includes('ev')) return HomeIcon;
    if (name.includes('moda')) return ShoppingBagIcon;
    return SparklesIcon;
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `${price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok';
  };

  const getBadgeColor = (savingsPercent) => {
    if (savingsPercent >= 30) return 'bg-red-500';
    if (savingsPercent >= 20) return 'bg-orange-500';
    if (savingsPercent >= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            En İyi Fiyatları{' '}
            <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Karşılaştırın
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            KKTC'nin farklı elektronik firmalarından anlık fiyat karşılaştırması yapın, en uygun fiyatı bulun.
          </p>
        </div>

        {/* Search Form with Recent Searches */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="flex items-center pl-6">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 px-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
                />
                <button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 font-semibold transition duration-200 transform hover:scale-105">
                  Ara
                </button>
              </div>
            </div>
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Son aramalar:</span>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="bg-white dark:bg-zinc-800 px-3 py-1 rounded-full text-sm border border-gray-200 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts?.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ortalama Tasarruf</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">%{stats.avgSavings?.toFixed(1)}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <BoltIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fiyat Filtresi */}
        <div className="mb-8 bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-orange-500" />
            Fiyat Aralığı
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceFilter.min}
                onChange={(e) => setPriceFilter(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                className="w-24 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              />
              <span className="text-gray-500">₺</span>
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Max"
                value={priceFilter.max}
                onChange={(e) => setPriceFilter(prev => ({ ...prev, max: parseInt(e.target.value) || 50000 }))}
                className="w-24 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              />
              <span className="text-gray-500">₺</span>
            </div>
            <button
              onClick={() => setPriceFilter({ min: 0, max: 50000 })}
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
            >
              Sıfırla
            </button>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Popüler Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat, index) => {
              const IconComponent = getCategoryIcon(cat.main);
              const slug = slugify(cat.main);
              return (
                <Link
                  key={slug || `category-${index}`}
                  href={`/main-category/${slug}`}
                  className="group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-zinc-700 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{cat.main}</h3>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Keşfet →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          {loading && visibleSections === 3 ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">En iyi fırsatlar yükleniyor...</p>
            </div>
          ) : (
            filteredSections.slice(0, visibleSections).map((section, i) => (
              <div key={`section-${i}`} className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <TrophyIcon className="w-7 h-7 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">En İyi Fırsatlar - {section.categoryTitle}</h2>
                  <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                    <span className="text-orange-700 dark:text-orange-400 text-sm font-medium">{section.groups.length} ürün</span>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
                  {section.groups.map((g, j) => (
                    <div key={g.slug || `group-${j}`} className="min-w-[300px] max-w-[300px] shrink-0 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-zinc-700 group">
                      <div className="relative">
                        <img
                          loading="lazy"
                          src={g.image || '/no-image.png'}
                          alt={g.title}
                          className="h-44 w-full object-contain bg-gray-50 dark:bg-zinc-700 p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        {g.savingsPercent > 0 && (
                          <div className={`absolute top-2 right-2 ${getBadgeColor(g.savingsPercent)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                            %{Math.round(g.savingsPercent)} TASARRUF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem]">
                          {g.title}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                              {formatPrice(g.price)}
                            </p>
                            {g.maxPrice > g.price && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="line-through">{formatPrice(g.maxPrice)}</span>
                              </p>
                            )}
                          </div>
                          <WatchlistButton productId={g.slug} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          {g.businessName || 'Satıcı Bilinmiyor'}
                        </p>
                        <Link
                          href={`/group/${g.slug}`}
                          className="block text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-xl font-semibold transition duration-200 transform hover:scale-105"
                        >
                          Fiyatları Karşılaştır
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Load More Trigger */}
        {!loading && filteredSections.length > visibleSections && (
          <div ref={loaderRef} className="text-center py-8">
            <div className="animate-bounce">
              <FireIcon className="w-6 h-6 text-orange-500 mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Daha fazla yükleniyor...</p>
          </div>
        )}
      </div>
    </main>
  );
}
