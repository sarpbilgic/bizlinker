// ✅ src/app/main-category/[slug]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  CpuChipIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const getCategoryIcon = (name = '') => {
  name = name.toLowerCase();
  if (name.includes('computer')) return CpuChipIcon;
  if (name.includes('mobile')) return DevicePhoneMobileIcon;
  if (name.includes('home')) return HomeIcon;
  if (name.includes('moda')) return ShoppingBagIcon;
  return SparklesIcon;
};

const slugify = (text) =>
  text?.toString().toLowerCase()
    .trim()
    .replace(/%20/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '') || '';

export default function MainCategoryPage() {
  const { slug } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const decodedSlug = decodeURIComponent(slug);
        const [catRes, groupRes, brandRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get(`/api/grouped-by-category?main=${decodedSlug}`),
          axios.get(`/api/brands?main_category=${decodedSlug}`)
        ]);

        const filtered = catRes.data.categories.find(c => slugify(c.main) === slugify(decodedSlug));
        setSubcategories(filtered?.subs || []);
        setProducts(groupRes.data);
        setBrands(brandRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const categoryItems = subcategories.flatMap(s => s.items);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-4 py-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
        {decodeURIComponent(slug).replace(/%20/g, ' ')} Ürünleri
      </h1>

      {/* Alt kategoriler */}
      {subcategories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Alt Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {subcategories.map((sub, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow border dark:border-zinc-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{sub.sub}</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {sub.items.map((item, j) => (
                    <li key={j}>
                      <Link href={`/category/${slugify(item)}?main_category=${slugify(slug)}&subcategory=${slugify(sub.sub)}`} className="hover:text-orange-600">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popüler Ürünler */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-orange-500" /> Popüler Ürünler
        </h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
            {products.flatMap(p => p.groups).map((g, i) => (
              <div key={i} className="snap-start min-w-[250px] max-w-[250px] bg-white dark:bg-zinc-800 rounded-xl shadow p-4 border dark:border-zinc-700">
                <img src={g.image || '/no-image.png'} className="h-36 w-full object-contain mb-3" alt={g.title} />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">{g.title}</h3>
                <p className="text-green-600 font-bold text-lg">{g.price?.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{g.businessName || 'Satıcı Bilinmiyor'}</p>
                <Link href={`/group/${g.slug}`} className="mt-3 block text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-xl font-semibold transition duration-200 transform hover:scale-105">
                  Fiyatları Karşılaştır
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Alt kategori itemlarından örnek karşılaştırmalar */}
      {!loading && categoryItems.slice(0, 3).map((item, index) => (
        <section key={index} className="mb-12">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            En Ucuz {item} Ürünleri
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {products.flatMap(p => p.groups)
              .filter(g => slugify(g.categoryTitle) === slugify(item))
              .slice(0, 10)
              .map((g, i) => (
                <div key={i} className="min-w-[250px] max-w-[250px] bg-white dark:bg-zinc-800 rounded-xl shadow p-4 border dark:border-zinc-700">
                  <img src={g.image || '/no-image.png'} className="h-36 w-full object-contain mb-3" alt={g.title} />
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">{g.title}</h3>
                  <p className="text-green-600 font-bold text-lg">{g.price?.toLocaleString('tr-TR')} ₺</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{g.businessName || 'Satıcı Bilinmiyor'}</p>
                  <Link href={`/group/${g.slug}`} className="mt-3 block text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-xl font-semibold transition duration-200 transform hover:scale-105">
                    Fiyatları Karşılaştır
                  </Link>
                </div>
              ))}
          </div>
        </section>
      ))}

      {/* Markalar */}
      {brands.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Popüler Markalar</h2>
          <div className="flex flex-wrap gap-3">
            {brands.slice(0, 40).map((b, i) => (
              <Link key={i} href={`/search?brand=${slugify(b.name)}&main_category=${slugify(slug)}`} className="bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-700 hover:text-orange-600">
                {b.name} ({b.count})
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
