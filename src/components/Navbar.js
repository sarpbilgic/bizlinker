'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-20 py-4 flex items-center justify-between gap-4">
        
        {/* Sol - Logo */}
        <Link href="/" className="text-3xl font-bold text-black">
          BizLinker
        </Link>

        {/* Orta - Kategoriler + Arama + Giriş */}
        <div className="flex items-center gap-4 flex-1 ml-2">
          <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium">
            Kategoriler
          </button>
          <input
            type="text"
            placeholder="Neyi ucuza almak istersin?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-[700px] px-4 py-2 rounded-full border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Link
            href="/auth"
            className="text-orange-600 text-m font-medium hover:underline"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </nav>
  );
}
