'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import BizlinkerLogo from '@/components/BizlinkerLogo';
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid credentials');
      }

      const data = await res.json();

      // API başarılı response döndürdüyse giriş başarılı demektir
      // Token cookie olarak set ediliyor, bu yüzden data.success kontrolü yapıyoruz
      if (data.success) {
        // AuthContext'e user bilgilerini kaydet
        if (data.user) {
          login(data.user);
        }
        router.push('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <BizlinkerLogo size="large" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Log in to your account and continue comparing prices.
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-5 h-5" />
                      Log In
                      <ChevronRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Register Link */}
            <div className="bg-gray-50 dark:bg-zinc-700/50 px-8 py-6 border-t border-gray-200 dark:border-zinc-600">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  Sign Up Now
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Features */}
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Easy Search</div>
              </div>
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Best Price</div>
              </div>
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Favorite Products</div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              ← Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
