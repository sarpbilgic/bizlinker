'use client';

import { useState } from 'react';
import MapWithBusinesses from '@components/MapWithBusinessesWrapper';

export default function BusinessListPage() {
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [location, setLocation] = useState(null);

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        alert('Could not get your location');
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] dark:bg-[#0f0f0f] text-black dark:text-white">
      {/* Sidebar */}
      <aside className="w-full sm:w-64 bg-[#f0f0f0] dark:bg-[#1a1a1a] p-6 space-y-6">
        <h2 className="text-xl font-bold text-[#1e3a8a]">Filter</h2>

        <button
          onClick={handleLocation}
          className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-2 rounded transition"
        >
          Use My Location
        </button>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white dark:bg-[#0f0f0f] border border-gray-400 dark:border-gray-600 rounded p-2 text-sm"
          >
            <option value="">All</option>
            <option value="beauty">Beauty</option>
            <option value="fitness">Fitness</option>
            <option value="repair">Repair</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full bg-white dark:bg-[#0f0f0f] border border-gray-400 dark:border-gray-600 rounded p-2 text-sm"
              placeholder="Min"
            />
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full bg-white dark:bg-[#0f0f0f] border border-gray-400 dark:border-gray-600 rounded p-2 text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </aside>

      {/* Harita */}
      <main className="flex-1 p-6">
        <MapWithBusinesses location={location} filters={{ category, priceRange }} />
      </main>
    </div>
  );
}
