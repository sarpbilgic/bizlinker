'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  TrophyIcon,
  BuildingStorefrontIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  FunnelIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import WatchlistButton from '@/components/WatchlistButton';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?query=${encodeURIComponent(query)}&min=${priceRange.min}&max=${priceRange.max}`)
      .then(res => {
        if (!res.ok) throw new Error('Search request failed');
        return res.json();
      })
      .then(response => {
        const results = response.data || [];
        const flattenedResults = [];
        results.forEach(group => {
          if (group.businesses && Array.isArray(group.businesses)) {
            group.businesses.forEach(business => {
              flattenedResults.push({
                _id: business._id || group._id + '-' + business.businessName,
                name: group.group_title,
                image: business.image || group.image,
                price: business.price,
                businessName: business.businessName,
                productUrl: business.productUrl,
                brand: business.brand,
                groupId: group._id,
                groupSlug: group.group_slug,
                createdAt: business.createdAt
              });
            });
          }
        });
        setResults(flattenedResults);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, priceRange]);

  const allowedFirms = ['Durmazz', 'Digikey Computer', 'Fıstık Bilgisayar'];

  const filteredResults = results
    .filter(item => allowedFirms.includes(item.businessName))
    .filter(item => selectedBusinesses.length === 0 || selectedBusinesses.includes(item.businessName))
    .filter(item => item.price >= priceRange.min && item.price <= priceRange.max);

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'price': return a.price - b.price;
      case 'name': return a.name.localeCompare(b.name);
      case 'business': return a.businessName.localeCompare(b.businessName);
      default: return a.price - b.price;
    }
  });

  const firmCheapest = {};
  filteredResults.forEach(item => {
    const firm = item.businessName;
    if (!firmCheapest[firm] || item.price < firmCheapest[firm].price) {
      firmCheapest[firm] = item;
    }
  });

  const comparisonProducts = Object.values(firmCheapest).sort((a, b) => a.price - b.price);

  const handleBusinessFilter = (business) => {
    setSelectedBusinesses(prev => 
      prev.includes(business) 
        ? prev.filter(b => b !== business)
        : [...prev, business]
    );
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `${price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mb-6">
              <MagnifyingGlassIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Arama Sonuçları</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="text-orange-600">{query}</span> için
              <br />
              <span className="text-2xl md:text-3xl bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {sortedResults.length} ürün bulundu
              </span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              3 farklı firmadan en uygun fiyatlı ürünleri karşılaştırın
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-orange-500" />
              Filtreler ve Sıralama
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sıralama:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              >
                <option value="price">Fiyat (Düşük → Yüksek)</option>
                <option value="name">İsim (A → Z)</option>
                <option value="business">Mağaza (A → Z)</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Fiyat:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 50000 }))}
                  className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
                <span className="text-gray-500 text-sm">₺</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Mağazalar:</label>
              <div className="flex flex-wrap gap-2">
                {allowedFirms.map(business => (
                  <button
                    key={business}
                    onClick={() => handleBusinessFilter(business)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      selectedBusinesses.includes(business)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {selectedBusinesses.includes(business) && <CheckCircleIcon className="w-3 h-3 inline mr-1" />}
                    {business}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Fiyatlar karşılaştırılıyor...</p>
          </div>
        ) : sortedResults.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
              Sonuç Bulunamadı
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-lg mb-6">
              {query} için belirlediğimiz firmalarda ürün bulunamadı
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-zinc-700">
                <SparklesIcon className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {sortedResults.length} ürün • {comparisonProducts.length} mağaza
                </span>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-green-600 font-semibold">
                  En ucuz: {comparisonProducts[0]?.price ? formatPrice(comparisonProducts[0].price) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedResults.map((item, index) => {
                const isLowestPrice = item.price === Math.min(...sortedResults.map(r => r.price));
                
                return (
                  <div 
                    key={item._id} 
                    className={`group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                      isLowestPrice
                        ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                        : 'border-gray-200 dark:border-zinc-700'
                    }`}
                  >
                    {isLowestPrice && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 transform rotate-12">
                        <TrophyIcon className="w-3 h-3 inline mr-1" />
                        EN UCUZ
                      </div>
                    )}

                    <div className="p-6">
                      <div className="w-full h-32 bg-gray-50 dark:bg-zinc-700 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-600 mb-4">
                        <img 
                          src={item.image || '/no-image.png'} 
                          alt={item.name} 
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
                          {item.name}
                        </h3>
                        
                        {item.brand && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md inline-block">
                            {item.brand}
                          </div>
                        )}

                        <div className={`text-2xl font-bold ${
                          isLowestPrice ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatPrice(item.price)}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BuildingStorefrontIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                              {item.businessName}
                            </span>
                          </div>
                          <WatchlistButton 
                            product={{
                              id: item._id,
                              name: item.name,
                              image: item.image,
                              price: item.price,
                              businessName: item.businessName,
                              productUrl: item.productUrl,
                              brand: item.brand
                            }}
                          />
                        </div>

                        <div className="pt-2">
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            Mağazaya Git
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {comparisonProducts.length > 1 && (
              <div className="mt-16">
                <div className="flex items-center gap-3 mb-8">
                  <TrophyIcon className="w-7 h-7 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mağaza Karşılaştırması</h2>
                  <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                    <span className="text-orange-700 dark:text-orange-400 text-sm font-medium">Her mağazadan en ucuz</span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {comparisonProducts.map((item, index) => (
                    <div 
                      key={item._id} 
                      className={`relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                        index === 0 
                          ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                          : 'border-gray-200 dark:border-zinc-700'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -top-2 right-4 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10 transform rotate-3">
                          <StarIcon className="w-4 h-4 inline mr-1" />
                          EN UCUZ
                        </div>
                      )}

                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-zinc-700 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-600">
                              <img 
                                src={item.image || '/no-image.png'} 
                                alt={item.name} 
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {item.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <BuildingStorefrontIcon className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {item.businessName}
                              </span>
                            </div>

                            <div className="md:hidden mb-4">
                              <div className={`text-3xl font-bold ${
                                index === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                              }`}>
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:flex flex-col items-end gap-4">
                            <div className={`text-3xl font-bold ${
                              index === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                            }`}>
                              {formatPrice(item.price)}
                            </div>
                            
                            <a
                              href={item.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                              Mağazaya Git
                              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </a>
                          </div>
                        </div>

                        <div className="md:hidden mt-4">
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            Mağazaya Git
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 