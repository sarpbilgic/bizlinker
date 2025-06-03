'use client';
import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/grouped-by-category')
      .then((res) => res.json())
      .then((data) => {
        setSections(data);
        setLoading(false);
      });
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const filteredSections = sections.map(section => ({
    ...section,
    groups: section.groups.filter(g =>
      (g.title || '').toLowerCase().includes(search.toLowerCase())
    )
  })).filter(section => section.groups.length > 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search)}`;
    }
  };

  // Category icons mapping
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 dark:from-orange-600/30 dark:to-blue-600/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-orange-200 dark:border-orange-800">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">En İyi Fiyatları Bul</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Fiyat Karşılaştırma
            <br />
            <span className="text-3xl md:text-5xl">Platformu</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Binlerce ürün arasından en uygun fiyatlı olanını bul. 4 farklı firmadan anlık fiyat karşılaştırması yap.
          </p>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
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
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 font-semibold transition duration-200 transform hover:scale-105"
                >
                  Ara
                </button>
              </div>
            </div>
          </form>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl mx-auto">
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Firma</div>
            </div>
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-600">1000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ürün</div>
            </div>
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 col-span-2 md:col-span-1">
              <div className="text-2xl font-bold text-green-600">%50</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasarruf</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Popular Categories */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popüler Kategoriler
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              En çok aranan kategorilerde fiyat karşılaştırması yapın
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => {
              const IconComponent = getCategoryIcon(cat.title);
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-zinc-700 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                      {cat.title}
                    </h3>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        Keşfet →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
            >
              <SparklesIcon className="w-5 h-5" />
              Tüm Kategoriler
            </Link>
          </div>
        </section>

        {/* Products Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">En iyi fiyatlar yükleniyor...</p>
          </div>
        ) : (
          filteredSections.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Aradığınız kriterde ürün bulunamadı
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Farklı anahtar kelimeler deneyebilirsiniz
              </p>
            </div>
          ) : (
            filteredSections.map((section, i) => (
              <div key={i} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      En Ucuz {section.categoryTitle} Fiyatları
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Firmalar arası fiyat karşılaştırması
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
                    {section.groups.map((g, j) => (
                      <div
                        key={`${g.slug}-${j}`}
                        className="group min-w-[280px] max-w-[280px] shrink-0 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-zinc-700"
                      >
                        <div className="relative">
                          <img
                            src={g.image || '/no-image.png'}
                            alt={g.title}
                            className="h-40 w-full object-contain bg-gray-50 dark:bg-zinc-700 p-4"
                          />
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            EN UCUZ
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-3 line-clamp-2">
                            {g.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="text-2xl font-bold text-green-600">
                              {typeof g.price === 'number' ? `${g.price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {g.businessName || 'Satıcı Bilinmiyor'}
                            </span>
                          </div>
                          
                          <Link
                            href={`/group/${g.slug}`}
                            className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-center py-3 rounded-xl font-semibold transition duration-200 transform group-hover:scale-105"
                          >
                            Fiyatları Karşılaştır
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </main>
  );
}