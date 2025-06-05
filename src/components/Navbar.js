'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';

export default function NavbarWithSearch() {
  const [categories, setCategories] = useState([]);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    axios.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
    axios.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    router.refresh();
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">BizLinker</Link>

        {/* Hamburger Menu Button (Mobile) */}
        <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Category Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoryOpen(true)}
            onMouseLeave={() => {
              setHoveredMain(null);
              setCategoryOpen(false);
            }}
          >
            <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-150">
              Kategoriler <ChevronDownIcon className="w-4 h-4" />
            </button>
            {categoryOpen && (
              <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-xl w-[700px] z-50 flex">
                <div className="w-64 border-r max-h-96 overflow-y-auto">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition ${hoveredMain === cat.main_category ? 'bg-gray-100 font-semibold' : ''}`}
                      onMouseEnter={() => setHoveredMain(cat.main_category)}
                    >
                      {cat.main_category}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {categories.find(c => c.main_category === hoveredMain)?.subcategories.map((sub, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-bold mb-1">{sub.subcategory}</h4>
                      <ul className="space-y-1">
                        {sub.items.map((item, j) => (
                          <li key={j}>
                            <Link
                              href={`/category/${item.item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="text-sm text-gray-600 hover:text-blue-600"
                            >
                              {item.item}
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

          {/* Search Bar */}
          <div className="w-[400px]">
            <SearchBar />
          </div>

          {/* User Menu */}
          <div
            className="relative"
            onMouseEnter={() => setUserOpen(true)}
            onMouseLeave={() => setUserOpen(false)}
          >
            {user ? (
              <button className="text-sm font-medium text-gray-700 hover:underline">
                {user.name || user.email}
              </button>
            ) : (
              <div className="flex gap-2 text-sm">
                <Link href="/login" className="hover:underline">Giriş Yap</Link>
                <span>/</span>
                <Link href="/register" className="hover:underline">Kayıt Ol</Link>
              </div>
            )}
            {user && userOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md py-2 text-sm z-50">
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Profilim
                </Link>
                <Link href="/watchlist" className="block px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                  <HeartIcon className="w-4 h-4" /> Favoriler
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Çıkış
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden px-4 pb-4 space-y-3">
          <SearchBar />
          <div>
            <button className="w-full text-left font-medium">Kategoriler</button>
            <div className="pl-4 space-y-2">
              {categories.map((cat, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold">{cat.main_category}</div>
                  <ul className="pl-2 text-sm text-gray-600">
                    {cat.subcategories?.flatMap(s => s.items).map((item, j) => (
                      <li key={j}>
                        <Link href={`/category/${item.item.toLowerCase().replace(/\s+/g, '-')}`}>{item.item}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {user ? (
            <div className="space-y-2">
              <Link href="/profile" className="block">Profilim</Link>
              <Link href="/watchlist" className="block">Favoriler</Link>
              <button onClick={handleLogout} className="block w-full text-left">Çıkış</button>
            </div>
          ) : (
            <div className="flex gap-2 text-sm">
              <Link href="/login" className="hover:underline">Giriş Yap</Link>
              <span>/</span>
              <Link href="/register" className="hover:underline">Kayıt Ol</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}