'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [menu, setMenu] = useState([]);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <nav className="w-full bg-white dark:bg-[#0f0f0f] border-b border-white/10 shadow-sm z-50 relative">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 dark:text-white hover:opacity-80"
        >
          BizLinker
        </Link>

        {/* Kategoriler Hover Menüsü */}
        <div
          className="relative"
          onMouseEnter={() => setCategoryOpen(true)}
          onMouseLeave={() => {
            setHoveredMain(null);
            setCategoryOpen(false);
          }}
        >
          <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium">
            Kategoriler
          </button>

          {categoryOpen && (
            <div className="absolute left-0 top-full mt-2 flex z-50 bg-white dark:bg-[#0f0f0f] shadow-lg border rounded min-w-[700px]">
              {/* Sol Menü */}
              <ul className="w-60 border-r max-h-[500px] overflow-auto">
                {menu.map((cat, idx) => (
                  <li
                    key={idx}
                    onMouseEnter={() => setHoveredMain(cat.main)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                      hoveredMain === cat.main ? 'bg-gray-100 dark:bg-zinc-800' : ''
                    }`}
                  >
                    {cat.main}
                  </li>
                ))}
              </ul>

              {/* Sağ Menü */}
              <div className="flex flex-col flex-wrap p-4 max-h-[500px] min-w-[500px]">
                {menu
                  .find((m) => m.main === hoveredMain)
                  ?.subs.map((sub, i) => (
                    <div key={i} className="mb-4 w-60">
                      <h4 className="font-semibold text-sm mb-1 dark:text-gray-200">{sub.sub}</h4>
                      <ul className="text-sm space-y-1">
                        {sub.items.map((item, j) => (
                          <li key={j}>
                            <Link
                              href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
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

        {/* Sağ Menüler */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="text-gray-700 dark:text-gray-300 hover:opacity-80"
          >
            {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>

          {/* Auth */}
          <div
            className="relative"
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <UserCircleIcon
              className="w-7 h-7 text-gray-700 dark:text-gray-300 hover:text-gray-500 cursor-pointer"
              onClick={() => router.push('/auth')}
            />
            {user && userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f0f0f] text-white border border-white/10 rounded-md shadow-lg text-sm z-[9999]">
                <Link href="/profile" className="block px-4 py-2 hover:bg-white/10">Profil</Link>
                <Link href="/watchlist" className="block px-4 py-2 hover:bg-white/10">Watchlist</Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-white/10">
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
