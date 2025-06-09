'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';

export default function WatchlistButton({ product, className = "" }) {
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && product) {
      checkIfInWatchlist();
    }
  }, [user, product]);

  const checkIfInWatchlist = () => {
    try {
      const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      if (savedWatchlist) {
        const watchlist = JSON.parse(savedWatchlist);
        const isInList = watchlist.some(item => item.id === product.id);
        setIsInWatchlist(isInList);
      }
    } catch (error) {
      console.error('Watchlist kontrol edilemedi:', error);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) {
      // Giriş yapmamış kullanıcıyı login sayfasına yönlendir
      window.location.href = '/login';
      return;
    }

    if (!product) return;

    setLoading(true);
    try {
      const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      let watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];

      if (isInWatchlist) {
        // Favorilerden çıkar
        watchlist = watchlist.filter(item => item.id !== product.id);
        setIsInWatchlist(false);
      } else {
        // Favorilere ekle
        const watchlistItem = {
          id: product.id || `${product.businessName}-${product.name}-${Date.now()}`,
          name: product.name,
          image: product.image,
          price: product.price,
          businessName: product.businessName,
          productUrl: product.productUrl,
          addedDate: new Date().toISOString(),
          ...product
        };
        watchlist.unshift(watchlistItem); // En başa ekle
        setIsInWatchlist(true);
      }

      localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(watchlist));

      // Optional: API'ye de gönderebiliriz
      // await fetch('/api/watchlist/toggle', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ product, action: isInWatchlist ? 'remove' : 'add' })
      // });

    } catch (error) {
      console.error('Watchlist güncellenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`relative group transition-all duration-200 ${className}`}
      title={isInWatchlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    >
      {loading ? (
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
      ) : isInWatchlist ? (
        <HeartIconSolid className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
      ) : (
        <HeartIconOutline className="w-6 h-6 text-gray-400 group-hover:text-red-500 group-hover:scale-110 transition-all" />
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {isInWatchlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      </div>
    </button>
  );
} 