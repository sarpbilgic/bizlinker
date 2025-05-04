'use client';
import { useState, useEffect } from 'react';
import SidebarFilter from '@/components/SidebarFilter';
import BusinessCard from '@/components/BusinessCard';

export default function HomePage() {
  const [filters, setFilters] = useState({ category: '', minPrice: 0, maxPrice: 1000, search: '' });
  const [location, setLocation] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBusinesses = async () => {
    if (!location) return;
    setLoading(true);
    const res = await fetch('/api/business/list', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userLocation: location, filters })
    });
    const data = await res.json();
    data.sort((a,b) => Math.min(...a.services.map(s=>s.price)) - Math.min(...b.services.map(s=>s.price)));
    setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => { fetchBusinesses(); }, [location, filters]);

  const locate = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude});
    }, () => alert('Enable location to search nearby')); 
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <button onClick={locate} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
          Use My Location
        </button>
        <input
          type="text"
          placeholder="Search services or businesses..."
          className="border p-2 rounded flex-1 max-w-lg"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
      </div>
      <div className="flex flex-col lg:flex-row w-full gap-6">
        <SidebarFilter filters={filters} setFilters={setFilters} />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center">Loading...</div>
          ) : (
            businesses.map(b => <BusinessCard key={b._id} business={b} />)
          )}
        </div>
      </div>
    </>
  );
}