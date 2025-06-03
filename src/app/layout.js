import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@components/Navbar';
import '@app/globals.css';

export const metadata = {
  title: 'BizLinker - Fiyat Karşılaştırma Platformu',
  description: 'En iyi fiyatları karşılaştırın, binlerce ürün arasından en uygun olanını bulun.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white font-sans antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            
            {/* Enhanced Footer */}
            <footer className="bg-gradient-to-r from-gray-900 to-zinc-900 dark:from-zinc-800 dark:to-black text-white">
              <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Logo & Description */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                        BizLinker
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 max-w-md">
                      En iyi fiyatları karşılaştırın ve binlerce ürün arasından en uygun olanını bulun. 
                      3 farklı firmadan anlık fiyat karşılaştırması.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>🏪 3 Firma</span>
                      <span>📦 1000+ Ürün</span>
                      <span>💰 En İyi Fiyat</span>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">Hızlı Linkler</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</a></li>
                      <li><a href="/categories" className="hover:text-orange-400 transition-colors">Kategoriler</a></li>
                      <li><a href="/search?q=bilgisayar" className="hover:text-orange-400 transition-colors">Popüler Aramalar</a></li>
                      <li><a href="/about" className="hover:text-orange-400 transition-colors">Hakkımızda</a></li>
                    </ul>
                  </div>

                  {/* Support */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">Destek</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="/help" className="hover:text-orange-400 transition-colors">Yardım Merkezi</a></li>
                      <li><a href="/contact" className="hover:text-orange-400 transition-colors">İletişim</a></li>
                      <li><a href="/privacy" className="hover:text-orange-400 transition-colors">Gizlilik</a></li>
                      <li><a href="/terms" className="hover:text-orange-400 transition-colors">Kullanım Şartları</a></li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} BizLinker. Tüm hakları saklıdır.
                  </p>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="text-gray-400 text-sm">Türkiye'nin fiyat karşılaştırma platformu</span>
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
