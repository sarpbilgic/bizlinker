'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function WatchlistButton({ product, className = "", size = "default" }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && product?.group_slug) {
      checkIfInWatchlist();
    }
  }, [user, product]);

  const checkIfInWatchlist = async () => {
    if (!user || !product?.group_slug) return;

    try {
      // API'den kontrol et
      const response = await axios.get('/api/watchlist');
      const apiWatchlist = response.data.data;
      const isInApiList = apiWatchlist.some(item => item.group_slug === product.group_slug);
      setIsInWatchlist(isInApiList);

      // localStorage'ı API ile senkronize et
      const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      let localWatchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];

      if (isInApiList && !localWatchlist.some(item => item.group_slug === product.group_slug)) {
        localWatchlist.unshift({
          ...product,
          addedDate: new Date().toISOString()
        });
        localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(localWatchlist));
      } else if (!isInApiList && localWatchlist.some(item => item.group_slug === product.group_slug)) {
        localWatchlist = localWatchlist.filter(item => item.group_slug !== product.group_slug);
        localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(localWatchlist));
      }
    } catch (error) {
      console.error('Watchlist kontrol edilemedi:', error);
    }
  };

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
        
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Watchlist güncellenemedi:', error);
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
      title={isInWatchlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
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
        {isInWatchlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      </div>
    </button>
  );
} 