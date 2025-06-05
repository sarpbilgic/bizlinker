"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ChevronDownIcon, UserIcon, LogOutIcon, HeartIcon } from 'lucide-react';

// Search Bar
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    axios
      .get(`/api/suggestions?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data;
        setSuggestions([
          ...data.group_titles.map((t) => ({ type: 'group', text: t })),
          ...data.product_names.map((t) => ({ type: 'product', text: t })),
          ...data.brands.map((t) => ({ type: 'brand', text: t })),
        ]);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <input
        type="text"
        placeholder="Ürün, marka veya kategori ara..."
        className="w-full border border-gray-300 bg-white text-black rounded-full px-4 py-2 shadow-sm focus:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {focused && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border mt-1 rounded-md shadow-lg z-40 max-h-64 overflow-y-auto text-sm">
          {suggestions.map((sug, idx) => (
            <li
              key={idx}
              onMouseDown={() => router.push(`/search?q=${encodeURIComponent(sug.text)}`)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
            >
              <span className="font-medium capitalize">{sug.type}:</span> {sug.text}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}