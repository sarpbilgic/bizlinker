'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  TrophyIcon,
  BuildingStorefrontIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok) throw new Error('Search request failed');
        return res.json();
      })
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  // Sadece belirli firmalar
  const allowedFirms = [
    'Durmazz',
    'Digikey Computer',
    'Fıstık Bilgisayar'
  ];

  // Her firmadan en ucuz ürünü bul
  const firmCheapest = {};
  results.forEach(item => {
    if (!allowedFirms.includes(item.businessName)) return;
    const firm = item.businessName;
    if (!firmCheapest[firm] || item.price < firmCheapest[firm].price) {
      firmCheapest[firm] = item;
    }
  });

  // Firma ürünlerini fiyata göre sırala (en ucuz en üstte)
  const sortedProducts = Object.values(firmCheapest).sort((a, b) => a.price - b.price);

  const getFirmIcon = (firmName) => {
    return BuildingStorefrontIcon;
  };

  const getFirmColor = (index) => {
    const colors = [
      'from-emerald-500 to-green-600', // En ucuz - yeşil
      'from-orange-500 to-amber-600',  // Orta - turuncu  
      'from-blue-500 to-indigo-600'    // En pahalı - mavi
    ];
    return colors[index] || colors[0];
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Header Section */}
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
                Firma Karşılaştırma
              </span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              3 farklı firmadan en uygun fiyatlı ürünleri karşılaştırın
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Fiyatlar karşılaştırılıyor...</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">En iyi teklifleri buluyoruz</p>
          </div>
        ) : sortedProducts.length === 0 ? (
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
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">İpucu:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 text-left space-y-1">
                <li>• Farklı anahtar kelimeler deneyin</li>
                <li>• Marka adı ekleyin</li>
                <li>• Daha genel terimler kullanın</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-zinc-700">
                <SparklesIcon className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {sortedProducts.length} firma bulundu
                </span>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-green-600 font-semibold">
                  En ucuz: {sortedProducts[0]?.price.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid gap-6 md:gap-8">
              {sortedProducts.map((item, index) => {
                const IconComponent = getFirmIcon(item.businessName);
                const gradientColor = getFirmColor(index);
                
                return (
                  <div 
                    key={item._id} 
                    className={`group relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                      index === 0 
                        ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                        : 'border-gray-200 dark:border-zinc-700'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center shadow-lg z-10`}>
                      {index === 0 ? (
                        <TrophyIcon className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      )}
                    </div>

                    {/* Best Deal Badge */}
                    {index === 0 && (
                      <div className="absolute -top-2 right-4 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10 transform rotate-3">
                        <StarIcon className="w-4 h-4 inline mr-1" />
                        EN UCUZ
                      </div>
                    )}

                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Product Image */}
                        <div className="shrink-0">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-zinc-700 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-600">
                            <img 
                              src={item.image || '/no-image.png'} 
                              alt={item.name} 
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {item.businessName}
                              </span>
                            </div>
                          </div>

                          {/* Mobile Price */}
                          <div className="md:hidden mb-4">
                            <div className={`text-3xl font-bold ${
                              index === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                            }`}>
                              {item.price?.toLocaleString('tr-TR')} ₺
                            </div>
                          </div>
                        </div>

                        {/* Desktop Price & Action */}
                        <div className="hidden md:flex flex-col items-end gap-4">
                          <div className={`text-3xl font-bold ${
                            index === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.price?.toLocaleString('tr-TR')} ₺
                          </div>
                          
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradientColor} hover:scale-105 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg`}
                          >
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            Siteye Git
                          </a>
                        </div>

                        {/* Mobile Action */}
                        <div className="md:hidden w-full">
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block w-full text-center bg-gradient-to-r ${gradientColor} hover:scale-105 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg`}
                          >
                            <ArrowTopRightOnSquareIcon className="w-5 h-5 inline mr-2" />
                            Siteye Git
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Savings Indicator */}
                    {index > 0 && (
                      <div className="absolute bottom-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium px-3 py-1 rounded-full">
                        +{(item.price - sortedProducts[0].price).toLocaleString('tr-TR')} ₺
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Info */}
            <div className="mt-12 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  💡 Nasıl Çalışıyor?
                </h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Her firmadan arama terininize en uygun ve en ucuz ürünü bulup karşılaştırıyoruz. 
                  Böylece en iyi teklifi kolayca görebilirsiniz.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 