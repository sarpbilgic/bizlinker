'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
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
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from '../components/WatchlistButton';

const fetcher = url => axios.get(url).then(res => res.data);

export default function HomePage() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [visibleSections, setVisibleSections] = useState(8);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 50000 });
  const [recentSearches, setRecentSearches] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [productsPerRow, setProductsPerRow] = useState(10);

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
      setVisibleSections((prev) => prev + 4);
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
          axios.get(`/api/grouped-by-category?limit=30`),
          axios.get('/api/categories')
        ]);

        setSections(sectionRes.data);
        setCategories(Array.isArray(categoriesRes.data.categories) ? categoriesRes.data.categories : []);
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
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
          console.warn('Location could not be retrieved:', error);
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
    return typeof price === 'number' ? `${price.toLocaleString('tr-TR')} ₺` : 'No Price';
  };

  const getBadgeColor = (savingsPercent) => {
    if (savingsPercent >= 30) return 'bg-red-500';
    if (savingsPercent >= 20) return 'bg-orange-500';
    if (savingsPercent >= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const scrollRow = (sectionId, direction) => {
    const container = document.getElementById(`product-row-${sectionId}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -container.offsetWidth : container.offsetWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleSectionExpansion = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hero Section with Enhanced Design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="absolute inset-0 bg-grid-white/15 [mask-image:linear-gradient(0deg,transparent,white)] dark:[mask-image:linear-gradient(0deg,transparent,white)]"></div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Find the <span className="text-yellow-300">Best Prices</span> in TRNC
            </h1>
            <p className="text-lg md:text-xl text-orange-100 max-w-2xl mx-auto mb-8">
              Compare prices across multiple electronics stores instantly and save money on your purchases.
            </p>

            {/* Enhanced Search Form */}
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                  <div className="relative flex bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-zinc-700/50 overflow-hidden">
                    <div className="flex items-center pl-6">
                      <MagnifyingGlassIcon className="w-6 h-6 text-orange-500" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for product, brand, or category..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="flex-1 px-4 py-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
                    />
                    <button type="submit" className="px-8 py-5 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition duration-200">
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Recent Searches with Enhanced Design */}
              {recentSearches.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-100">
                  <span>Recent:</span>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <Link
                        key={i}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Section with Enhanced Design */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 flex items-center gap-4 hover:border-orange-500 transition-colors">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts?.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 flex items-center gap-4 hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueGroups?.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 flex items-center gap-4 hover:border-green-500 transition-colors">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <BoltIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Businesses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8+</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Sections with Enhanced Design */}
        {filteredSections.slice(0, visibleSections).map((section, index) => (
          <section key={section.categorySlug} className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <FireIcon className="w-6 h-6 text-orange-500" />
                  {section.categoryTitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {section.groups.length} products available
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => scrollRow(section.categorySlug, 'left')}
                    className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => scrollRow(section.categorySlug, 'right')}
                    className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <Link
                  href={`/category/${section.categorySlug}`}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  View All
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div 
                id={`product-row-${section.categorySlug}`}
                className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide scroll-smooth snap-x snap-mandatory"
              >
                {section.groups
                  .slice(0, expandedSections.has(section.categorySlug) ? section.groups.length : productsPerRow)
                  .map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="min-w-[300px] max-w-[300px] snap-start bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-lg group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Image
                        src={group.image || '/no-image.png'}
                        alt={group.title || 'Product image'}
                        width={300}
                        height={192}
                        className="w-full h-48 object-contain bg-white dark:bg-zinc-900 p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                      {group.savingsPercent > 0 && (
                        <div className={`absolute top-2 right-2 ${getBadgeColor(group.savingsPercent)} text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg`}>
                          Save {Math.round(group.savingsPercent)}%
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <Link href={`/group/${group.slug}`}>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-2 line-clamp-2 hover:text-orange-500 transition-colors">
                          {group.title}
                        </h3>
                      </Link>

                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(group.price)}
                          </p>
                          {group.maxPrice > group.price && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Up to {formatPrice(group.maxPrice)}
                            </p>
                          )}
                        </div>
                        <WatchlistButton 
                          product={{
                            group_slug: group.slug,
                            title: group.title,
                            image: group.image,
                            price: group.price,
                            maxPrice: group.maxPrice,
                            businessName: group.businessName
                          }} 
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <ShoppingBagIcon className="w-4 h-4" />
                          {group.businessName}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <TagIcon className="w-4 h-4" />
                          {group.productCount} sellers
                        </span>
                      </div>

                      <Link
                        href={`/group/${group.slug}`}
                        className="block text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-4 rounded-lg font-semibold transition duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                      >
                        Compare Prices
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced gradient fade */}
              <div className="absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-slate-50 dark:from-zinc-900 to-transparent pointer-events-none"></div>
            </div>

            {/* Enhanced Show More/Less Button */}
            {section.groups.length > productsPerRow && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => toggleSectionExpansion(section.categorySlug)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-300 hover:shadow-md"
                >
                  {expandedSections.has(section.categorySlug) ? (
                    <>
                      Show Less
                      <ChevronUpIcon className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show More ({section.groups.length - productsPerRow} more)
                      <ChevronDownIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        ))}

        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading amazing deals...</p>
          </div>
        )}

        {/* Enhanced Load More Button */}
        {!loading && filteredSections.length > visibleSections && (
          <div className="text-center py-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
            >
              Load More Categories
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
