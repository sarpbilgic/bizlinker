// ✅ Yeni Navbar: Akakce benzeri, responsive, search suggestion entegreli, daisyUI + shadcn uyumlu
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [menu, setMenu] = useState([]);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    axios.get('/api/categories')
      .then(res => setMenu(res.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (search.trim().length > 1) {
      axios.get(`/api/search/suggestions?q=${encodeURIComponent(search.trim())}`)
        .then(res => {
          const allSuggestions = Object.values(res.data.suggestions || {}).flat();
          setSuggestions(allSuggestions);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [search]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-zinc-900 border-b shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
        {categoryOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-40" onClick={() => setCategoryOpen(false)}></div>
        )}

        <div className="flex items-center justify-between h-16 relative z-50 gap-3">
          <Link href="/" className="text-xl font-bold text-orange-600 dark:text-white">
            BizLinker
          </Link>

          <div className="relative hidden lg:block"
            onMouseEnter={() => setCategoryOpen(true)}
            onMouseLeave={() => {
              setTimeout(() => {
                setHoveredMain(null);
                setCategoryOpen(false);
              }, 200);
            }}
          >
            <button className="flex items-center gap-1 px-4 py-2 rounded-md bg-orange-500 text-white text-sm font-medium">
              Kategoriler
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-[48px] flex z-50 bg-white dark:bg-zinc-800 shadow-xl border rounded-xl min-w-[750px] overflow-hidden">
                <div className="w-64 border-r max-h-[400px] overflow-y-auto">
                  {Array.isArray(menu) && menu.map((cat, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredMain(cat.main)}
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900 ${hoveredMain === cat.main ? 'bg-orange-100 dark:bg-orange-800 font-semibold' : ''}`}
                    >
                      {cat.main}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-6 max-h-[400px] overflow-y-auto bg-white dark:bg-zinc-900">
                  <div className="grid grid-cols-2 gap-6">
                    {menu.find((m) => m.main === hoveredMain)?.subs.map((sub, i) => (
                      <div key={i}>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white border-b pb-1 mb-2">{sub.sub}</h4>
                        <ul className="space-y-1">
                          {sub.items.map((item, j) => (
                            <li key={j}>
                              <Link href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-600">
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col relative w-1/2">
            <form onSubmit={handleSearch} className="flex items-center w-full">
              <input
                type="text"
                placeholder="Search for a product, brand or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-700 dark:text-white"
              />
              <button type="submit" className="-ml-8 text-gray-500 dark:text-white">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-800 shadow-lg border rounded-md mt-1 max-h-60 overflow-y-auto z-50">
                {suggestions.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        setSearch(item);
                        router.push(`/search?q=${encodeURIComponent(item)}`);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900 text-gray-700 dark:text-gray-200"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative hidden lg:block"
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setTimeout(() => setUserMenuOpen(false), 200)}
          >
            <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">
              <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
              {user && <span className="text-gray-700 dark:text-white">{user.name || 'My Account'}</span>}
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border rounded-md shadow-lg">
                {user ? (
                  <>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800">👤 Profile</Link>
                    <Link href="/watchlist" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800">⭐ Watchlist</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900">🚪 Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800">🔑 Login</Link>
                    <Link href="/register" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800">✨ Register</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="hidden lg:block p-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-200"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-t shadow-md z-40 py-4 space-y-2">
            {user ? (
              <>
                <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900">👤 Profile</Link>
                <Link href="/watchlist" className="block px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900">⭐ Watchlist</Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900">🔑 Login</Link>
                <Link href="/register" className="block px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900">✨ Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
