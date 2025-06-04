'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  MoonIcon, 
  SunIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [menu, setMenu] = useState([]);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories?type=menu')
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error('Failed to load categories menu', err));
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
    <nav className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200/20 dark:border-zinc-700/20 shadow-lg z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              BizLinker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Kategoriler Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoryOpen(true)}
              onMouseLeave={() => {
                setHoveredMain(null);
                setCategoryOpen(false);
              }}
            >
              <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Kategoriler
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {categoryOpen && (
                <div className="absolute left-0 top-full mt-3 flex z-50 bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700 rounded-2xl min-w-[750px] overflow-hidden">
                  {/* Sol Menü */}
                  <div className="w-64 border-r border-gray-200 dark:border-zinc-700 max-h-[400px] overflow-y-auto">
                    {menu.map((cat, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredMain(cat.main)}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                          hoveredMain === cat.main 
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-r-2 border-orange-500' 
                            : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="font-medium">{cat.main}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sağ Menü */}
                  <div className="flex-1 p-6 max-h-[400px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                      {menu
                        .find((m) => m.main === hoveredMain)
                        ?.subs.map((sub, i) => (
                          <div key={i} className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-zinc-700 pb-2">
                              {sub.sub}
                            </h4>
                            <ul className="space-y-2">
                              {sub.items.map((item, j) => (
                                <li key={j}>
                                  <Link
                                    href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
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
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              title={darkMode ? 'Açık tema' : 'Koyu tema'}
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            <div
              className="relative"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <UserCircleIcon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                {user && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name || 'Kullanıcı'}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-[9999] overflow-hidden">
                  {user ? (
                    <>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        👤 Profil
                      </Link>
                      <Link 
                        href="/watchlist" 
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        ⭐ Favoriler
                      </Link>
                      <div className="border-t border-gray-200 dark:border-zinc-700">
                        <button 
                          onClick={logout} 
                          className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          🚪 Çıkış Yap
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        🔑 Giriş Yap
                      </Link>
                      <Link 
                        href="/register" 
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        ✨ Kayıt Ol
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-zinc-700 py-4 space-y-4">
            <div className="space-y-2">
              <button 
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <span>Kategoriler</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {categoryOpen && (
                <div className="pl-4 space-y-1 max-h-60 overflow-y-auto">
                  {menu.map((cat, idx) => (
                    <div key={idx} className="py-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 py-1">
                        {cat.main}
                      </div>
                      {cat.subs.map((sub, i) => (
                        <div key={i} className="pl-3">
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 py-1">
                            {sub.sub}
                          </div>
                          {sub.items.slice(0, 3).map((item, j) => (
                            <Link
                              key={j}
                              href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block text-xs text-gray-500 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 py-1 pl-2"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Tema</span>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
              {user ? (
                <>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👤 Profil
                  </Link>
                  <Link 
                    href="/watchlist" 
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⭐ Favoriler
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    🚪 Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔑 Giriş Yap
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ✨ Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
