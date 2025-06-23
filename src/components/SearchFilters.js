import { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  CheckCircleIcon,
  ArrowsUpDownIcon,
  TagIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function SearchFilters({ 
  onFiltersChange,
  initialFilters = {},
  showBusinessFilter = true,
  showBrandFilter = true,
  showPriceFilter = true,
  showSortFilter = true
}) {
  const [filters, setFilters] = useState({
    sortBy: 'price_asc',
    priceRange: { min: 0, max: 50000 },
    selectedBusinesses: [],
    selectedBrands: [],
    ...initialFilters
  });

  const [filterOptions, setFilterOptions] = useState({
    businesses: [],
    brands: [],
    priceRange: { min: 0, max: 50000 }
  });

  useEffect(() => {
    // Fetch filter options from API
    fetch('/api/filter-options')
      .then(res => res.json())
      .then(data => {
        setFilterOptions({
          businesses: data.filters?.businessNames || [],
          brands: data.filters?.brands || [],
          priceRange: data.filters?.priceRange || { min: 0, max: 50000 }
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: parseInt(value) || 0
      }
    }));
  };

  const toggleBusinessFilter = (business) => {
    setFilters(prev => ({
      ...prev,
      selectedBusinesses: prev.selectedBusinesses.includes(business)
        ? prev.selectedBusinesses.filter(b => b !== business)
        : [...prev.selectedBusinesses, business]
    }));
  };

  const toggleBrandFilter = (brand) => {
    setFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter(b => b !== brand)
        : [...prev.selectedBrands, brand]
    }));
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-orange-500" />
          Filtreler ve Sıralama
        </h3>
      </div>

      <div className="space-y-6">
        {showSortFilter && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ArrowsUpDownIcon className="w-4 h-4" />
              Sıralama
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            >
              <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
              <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
              <option value="name_asc">İsim (A → Z)</option>
              <option value="name_desc">İsim (Z → A)</option>
              <option value="date_desc">En Yeni</option>
            </select>
          </div>
        )}

        {showPriceFilter && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4" />
              Fiyat Aralığı
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-28 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-28 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              />
              <span className="text-gray-500 text-sm">₺</span>
            </div>
          </div>
        )}

        {showBusinessFilter && filterOptions.businesses.length > 0 && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <BuildingStorefrontIcon className="w-4 h-4" />
              Mağazalar
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.businesses.map(business => (
                <button
                  key={business}
                  onClick={() => toggleBusinessFilter(business)}
                  className={`px-3 py-1 rounded-full text-sm transition flex items-center gap-1 ${
                    filters.selectedBusinesses.includes(business)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  {filters.selectedBusinesses.includes(business) && (
                    <CheckCircleIcon className="w-3 h-3" />
                  )}
                  {business}
                </button>
              ))}
            </div>
          </div>
        )}

        {showBrandFilter && filterOptions.brands.length > 0 && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Markalar
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => toggleBrandFilter(brand)}
                  className={`px-3 py-1 rounded-full text-sm transition flex items-center gap-1 ${
                    filters.selectedBrands.includes(brand)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  {filters.selectedBrands.includes(brand) && (
                    <CheckCircleIcon className="w-3 h-3" />
                  )}
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 