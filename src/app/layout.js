import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import './globals.css';
import Providers from './providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const metadata = {
  title: 'Bizlinker - Compare Prices Across Multiple Stores',
  description: 'Find the best prices by comparing products across multiple stores in North Cyprus',
  keywords: 'price comparison, cheapest price, shopping, online shopping, product comparison',
  authors: [{ name: 'BizLinker' }],
  openGraph: {
    title: 'BizLinker - Price Comparison Platform',
    description: 'Compare the best prices and find the most affordable option among thousands of products.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/bizlinker_logo.png',
        sizes: '32x32',
        type: 'image/png'
      }
    ]
  }
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
            
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
