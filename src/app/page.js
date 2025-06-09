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
  FireIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [visibleSections, setVisibleSections] = useState(3);

  const loaderRef = useRef();

  const loadMore = useCallback(() => {
    setVisibleSections((prev) => prev + 2);
  }, []);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) loadMore();
  }, [loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionRes = await axios.get('/api/grouped-by-category');
        const categoriesRes = await axios.get('/api/categories');
        const statsRes = await axios.get('/api/stats');

        setSections(sectionRes.data);
        setCategories(Array.isArray(categoriesRes.data.categories) ? categoriesRes.data.categories : []);
        setStats(statsRes.data);
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
  }, []);

  const filteredSections = sections
    .map(section => ({
      ...section,
      groups: section.groups
        .filter(g => (g.title || '').toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.price - b.price)
    }))
    .filter(section => section.groups.length >= 4);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <div className="flex items-center pl-6">
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
              </div>
              <input
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

        {location && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Konum: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        )}

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
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          ) : (
            filteredSections.slice(0, visibleSections).map((section, i) => (
              <div key={`section-${i}`} className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                  <StarIcon className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">En Ucuz {section.categoryTitle}</h2>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
                  {section.groups.map((g, j) => (
                    <div key={g.slug || `group-${j}`} className="min-w-[280px] max-w-[280px] shrink-0 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-zinc-700">
                      <div className="relative">
                        <img
                          loading="lazy"
                          src={g.image || '/no-image.png'}
                          alt={g.title}
                          className="h-40 w-full object-contain bg-gray-50 dark:bg-zinc-700 p-4"
                        />
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">EN UCUZ</div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-3 line-clamp-2">{g.title}</h3>
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          {typeof g.price === 'number' ? `${g.price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok'}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{g.businessName || 'Satıcı Bilinmiyor'}</p>
                        <Link href={`/group/${g.slug}`} className="block text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-xl font-semibold transition duration-200 transform hover:scale-105">
                          Fiyatları Karşılaştır
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={loaderRef} className="h-10" />
        </section>
      </div>
    </main>
  );
}
