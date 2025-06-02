'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [menu, setMenu] = useState([]);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/categories/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Sol - Logo ve Kategoriler */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-3xl font-bold text-black">
            BizLinker
          </Link>

          {/* Kategoriler Butonu + Menü */}
          <div
            className="relative ml-4"
            onMouseEnter={() => setCategoryOpen(true)}
            onMouseLeave={() => {
              setHoveredMain(null);
              setCategoryOpen(false);
            }}
          >
            <button className="bg-orange-500 text-white px-4 py-2 rounded text-m font-medium">
              Kategoriler
            </button>

            {categoryOpen && (
              <div className="absolute left-0 top-full flex z-50 bg-orange-500 shadow-lg border rounded min-w-[700px]">
                <ul className="w-60 border-r max-h-[500px] overflow-auto text-white">
                  {menu.map((cat, idx) => (
                    <li
                      key={idx}
                      onMouseEnter={() => setHoveredMain(cat.main)}
                      className={`px-4 py-2 text-m cursor-pointer hover:bg-black ${
                        hoveredMain === cat.main ? 'bg-black' : ''
                      }`}
                    >
                      {cat.main}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col flex-wrap p-4 max-h-[500px] min-w-[500px]">
                  {menu.find((m) => m.main === hoveredMain)?.subs.map((sub, i) => (
                    <div key={i} className="mb-4 w-60">
                      <h4 className="font-semibold text-m mb-1 text-white">{sub.sub}</h4>
                      <ul className="text-m space-y-1">
                        {sub.items.map((item, j) => (
                          <li key={j}>
                            <Link
                              href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="text-black hover:underline"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orta - Arama Kutusu */}
        <input
          type="text"
          placeholder="Neyi ucuza almak istersin?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="flex-1 max-w-[850px] px-4 py-2 rounded-full border border-orange-500 text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* Sağ - Giriş Yap Butonu */}
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600 transition">
              Giriş Yap
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
