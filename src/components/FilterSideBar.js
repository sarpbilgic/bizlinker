import { useState } from 'react';

export default function FilterSidebar({ categories, onFilter }) {
  const [selectedCats, setSelectedCats] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);

  const toggleCategory = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const applyFilters = () => {
    onFilter({ categories: selectedCats, minRating, maxPrice });
  };

  return (
    <aside className="w-64 p-4 bg-white rounded-md shadow">
      <h2 className="text-lg font-semibold mb-2">Filters</h2>
      <div className="mb-4">
        <h3 className="font-medium">Categories</h3>
        {categories.map((cat) => (
          <label key={cat} className="block">
            <input
              type="checkbox"
              checked={selectedCats.includes(cat)}
              onChange={() => toggleCategory(cat)}
              className="mr-2"
            />
            {cat}
          </label>
        ))}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Minimum Rating</h3>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="w-full"
        />
        <span>{minRating}+</span>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Max Price ($)</h3>
        <input
          type="number"
          min={0}
          max={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full p-1 border border-gray-300 rounded"
        />
      </div>
      <button
        onClick={applyFilters}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Apply
      </button>
    </aside>
  );
}