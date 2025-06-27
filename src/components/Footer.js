'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BizlinkerLogo from './BizlinkerLogo';

export default function Footer() {
  const [stats, setStats] = useState({
    products: '15673',
    stores: '8'
  });
  const [businesses, setBusinesses] = useState([]);

  const popularCategories = [
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Network Devices', slug: 'network-devices' },
    { name: 'Computer Accessories', slug: 'computer-accessories' },
    { name: 'Audio & Video', slug: 'audio-video' },
    { name: 'Apple Accessories', slug: 'apple-accessories' },
    { name: 'Smart Home', slug: 'smart-home' }
  ];

  const quickLinks = [
    { name: 'Advanced Search', href: '/search' },
    { name: 'All Categories', href: '/categories' },
    { name: 'My Watchlist', href: '/watchlist' },
    { name: 'My Profile', href: '/profile' }
  ];

  useEffect(() => {
    // İşletmeleri çek
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setBusinesses(data.data);
          setStats(prev => ({ ...prev, stores: data.total.toString() }));
        }
      })
      .catch(err => console.error('Failed to load businesses:', err));

    // İstatistikleri çek
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.totalProducts) {
          setStats(prev => ({ ...prev, products: data.totalProducts.toString() }));
        }
      })
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  // Eğer işletmeler yüklenmediyse veya boşsa, varsayılan işletmeleri göster
  const defaultBusinesses = [
    { name: 'Durmazz', website: 'https://durmazz.com' },
    { name: 'Kıbrıs Teknoloji', website: 'https://kibristeknoloji.com' },
    { name: 'Technoplus Global', website: 'https://technoplusglobal.com' },
    { name: 'Sharaf Store', website: 'https://sharafstore.com' },
    { name: 'Teknogold', website: 'https://teknogold.com' },
    { name: 'Digikey Computer', website: 'https://www.digikeycomputer.com' },
   
  ];

  const displayBusinesses = businesses.length > 0 ? businesses : defaultBusinesses;

  return (
    <footer className="bg-white dark:bg-zinc-900 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold">Bizlinker</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Compare prices across multiple stores in North Cyprus and find the best deals.
            </p>
            <div className="mt-4 flex gap-8">
              <div>
                <span className="block text-orange-500 font-semibold">{stats.products}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Products</span>
              </div>
              <div>
                <span className="block text-orange-500 font-semibold">{stats.stores}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Stores</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="col-span-1">
            <h3 className="font-medium mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              {popularCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Stores */}
          <div className="col-span-1">
            <h3 className="font-medium mb-4">Featured Stores</h3>
            <ul className="space-y-2">
              {displayBusinesses.map((business, index) => (
                <li key={business._id || index}>
                  <a 
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500"
                  >
                    {business.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Bizlinker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}