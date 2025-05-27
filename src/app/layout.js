import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@components/Navbar';
import '@app/globals.css';
import Head from 'next/head';

export const metadata = {
  title: 'BizLinker',
  description: 'Connect with local businesses near you',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#f9f9f9] text-gray-900 font-sans antialiased  dark:text-white overflow-visible relative">
        <AuthProvider>
          <div className="relative z-0"> 
            <Navbar />
            <main className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {children}
            </main>
            <footer className="mt-20 py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-[#0f0f0f]">
              © {new Date().getFullYear()} BizLinker. All rights reserved.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
