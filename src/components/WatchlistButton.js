'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Cache watchlist globally to prevent redundant API calls
let watchlistCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute

export default function WatchlistButton({ product, className = "", size = "default" }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  // Only depend on primitives, not the entire object
  const userId = user?.id;
  const groupSlug = product?.group_slug;

  const checkIfInWatchlist = useCallback(async () => {
    if (!userId || !groupSlug) return;

    try {
      // First check localStorage (fastest)
      const savedWatchlist = localStorage.getItem(`watchlist_${userId}`);
      if (savedWatchlist) {
        const localWatchlist = JSON.parse(savedWatchlist);
        const isInLocal = localWatchlist.some(item => item.group_slug === groupSlug);
        setIsInWatchlist(isInLocal);
      }

      // Use cached watchlist or fetch if cache is stale
      const now = Date.now();
      if (!watchlistCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
        const response = await axios.get('/api/watchlist');
        watchlistCache = response.data.data;
        cacheTimestamp = now;
      }

      // Check against cached API data
      const isInApiList = watchlistCache.some(item => item.group_slug === groupSlug);
      setIsInWatchlist(isInApiList);

      // Sync localStorage with API if needed
      if (savedWatchlist) {
        let localWatchlist = JSON.parse(savedWatchlist);
        if (isInApiList && !localWatchlist.some(item => item.group_slug === groupSlug)) {
          localWatchlist.unshift({
            ...product,
            addedDate: new Date().toISOString()
          });
          localStorage.setItem(`watchlist_${userId}`, JSON.stringify(localWatchlist));
        } else if (!isInApiList && localWatchlist.some(item => item.group_slug === groupSlug)) {
          localWatchlist = localWatchlist.filter(item => item.group_slug !== groupSlug);
          localStorage.setItem(`watchlist_${userId}`, JSON.stringify(localWatchlist));
        }
      }
    } catch (error) {
      console.error('Watchlist could not be checked:', error);
    }
  }, [userId, groupSlug, product]);

  useEffect(() => {
    if (userId && groupSlug && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      checkIfInWatchlist();
    }
  }, [userId, groupSlug, checkIfInWatchlist]);

  const toggleWatchlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product?.group_slug) {
      console.error('Product group_slug is required');
      return;
    }

    setLoading(true);
    try {
      if (isInWatchlist) {
        // Favorilerden çıkar
        await axios.delete(`/api/watchlist?group_slug=${encodeURIComponent(product.group_slug)}`);
        
        // localStorage'dan da çıkar
        const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
        if (savedWatchlist) {
          const watchlist = JSON.parse(savedWatchlist);
          const updatedWatchlist = watchlist.filter(item => item.group_slug !== product.group_slug);
          localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(updatedWatchlist));
        }
        
        // Clear cache to force refresh
        watchlistCache = null;
        cacheTimestamp = null;
        
        setIsInWatchlist(false);
      } else {
        // Favorilere ekle
        await axios.post('/api/watchlist', { group_slug: product.group_slug });
        
        // localStorage'a da ekle
        const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
        let watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];
        watchlist.unshift({
          ...product,
          addedDate: new Date().toISOString()
        });
        localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(watchlist));
        
        // Clear cache to force refresh
        watchlistCache = null;
        cacheTimestamp = null;
        
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Watchlist could not be updated:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "large" ? "w-8 h-8" : size === "small" ? "w-4 h-4" : "w-6 h-6";

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`relative group transition-all duration-200 ${className}`}
      title={isInWatchlist ? 'Remove from Favorites' : 'Add to Favorites'}
    >
      {loading ? (
        <div className={`${iconSize} animate-spin rounded-full border-2 border-red-500 border-t-transparent`}></div>
      ) : isInWatchlist ? (
        <HeartIconSolid className={`${iconSize} text-red-500 group-hover:scale-110 transition-transform`} />
      ) : (
        <HeartIconOutline className={`${iconSize} text-gray-400 group-hover:text-red-500 group-hover:scale-110 transition-all`} />
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {isInWatchlist ? 'Remove from Favorites' : 'Add to Favorites'}
      </div>
    </button>
  );
} 