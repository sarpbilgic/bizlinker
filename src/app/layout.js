import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import './globals.css';
import Providers from './providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const metadata = {
  title: 'BizLinker - Price Comparison Platform',
  description: 'Compare the best prices and find the most affordable option among thousands of products.',
  keywords: 'price comparison, cheapest price, shopping, online shopping, product comparison',
  authors: [{ name: 'BizLinker' }],
  openGraph: {
    title: 'BizLinker - Price Comparison Platform',
    description: 'Compare the best prices and find the most affordable option among thousands of products.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#f97316" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white font-sans antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Skip to main content for accessibility */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-orange-500 focus:text-white">
              Skip to main content
            </a>
            
            <Navbar />
            
            <main id="main-content" className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              <Providers>{children}</Providers>
            </main>
            
            {/* Enhanced Footer with Animation */}
            <footer className="relative bg-gradient-to-r from-gray-900 to-zinc-900 dark:from-zinc-800 dark:to-black text-white overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
              <div className="relative max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Logo & Description */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                        BizLinker
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 max-w-md leading-relaxed">
                      Compare the best prices and find the most affordable option among thousands of products. 
                      Save by instantly comparing prices from 8 different businesses.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                        🏪 8 Businesses
                      </span>
                      <span className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                        📦 10000+ Product
                      </span>
                      <span className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                        💰 Best Price
                      </span>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="font-semibold text-white mb-4 relative">
                      Quick Links
                      <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></span>
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        <Link href="/" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/categories" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Categories
                        </Link>
                      </li>
                      <li>
                        <Link href="/search?q=bilgisayar" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Popular Searches
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          About Us
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Support */}
                  <div>
                    <h3 className="font-semibold text-white mb-4 relative">
                      Support
                      <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></span>
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        <Link href="/help" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Contact
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Privacy
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          Terms of Use
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} BizLinker. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="text-gray-400 text-sm">TRNC's price comparison platform</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
