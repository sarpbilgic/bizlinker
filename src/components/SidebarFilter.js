'use client';

export default function FilterSidebar({ filters, setFilters, categories }) {
  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  return (
    <aside className="w-64 hidden lg:block bg-gray-100 dark:bg-[#1a1a1a] p-6 border-r border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-cyan-100">Filter</h2>

      {/* Kategori seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={filters.category}
          onChange={handleCategoryChange}
          className="w-full bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-600 rounded p-2 text-sm"
        >
          <option value="">All</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Fiyat aralığı */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Price Range (₺)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="priceMin"
            placeholder="Min"
            value={filters.priceMin}
            onChange={handlePriceChange}
            className="w-1/2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-600 rounded p-2 text-sm"
          />
          <input
            type="number"
            name="priceMax"
            placeholder="Max"
            value={filters.priceMax}
            onChange={handlePriceChange}
            className="w-1/2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-600 rounded p-2 text-sm"
          />
        </div>
      </div>
    </aside>
  );
}
