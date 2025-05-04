'use client';
import { useState, useEffect } from 'react';

export default function SidebarFilter({ filters, setFilters }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/business/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  return (
    <aside className="bg-white p-4 rounded shadow flex-shrink-0 w-full lg:w-64">
      <h4 className="font-semibold mb-2">Filter By</h4>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Category</label>
          <select
            className="w-full border p-2 rounded"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/2 border p-2 rounded"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: parseInt(e.target.value) }))}
            />
            <input
              type="number"
              className="w-1/2 border p-2 rounded"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}