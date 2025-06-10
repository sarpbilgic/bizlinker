'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  CogIcon,
  HeartIcon,
  BellIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import SecuritySettings from '@/components/profile/SecuritySettings';
import RecentlyViewed from '@/components/profile/RecentlyViewed';
import ChangePassword from '@/components/profile/ChangePassword';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, password
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // localStorage'dan user bilgilerini al
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        const userData = JSON.parse(userFromStorage);
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || ''
        });
        setLoading(false);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccess('Profil başarıyla güncellendi!');
        setEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      setError('Güncelleme sırasında bir hata oluştu');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                BizLinker
              </span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm">Çıkış Yap</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.name || 'Hoş Geldiniz'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Profil bilgilerinizi yönetin
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              Profil Bilgileri
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              Güvenlik Ayarları
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              Şifre Değiştir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserIcon className="w-6 h-6" />
                      Profil Bilgileri
                    </h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span className="text-sm">Düzenle</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                    </div>
                  )}

                  {editing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Ad Soyad
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                            placeholder="Adınız ve soyadınız"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Email Adresi
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {updateLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              Güncelleniyor...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="w-5 h-5" />
                              Kaydet
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <XMarkIcon className="w-5 h-5" />
                          İptal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      {/* Display Mode */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Ad Soyad
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded-xl">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{user?.name || 'Belirtilmemiş'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Email Adresi
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded-xl">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'password' && <ChangePassword />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                Hesap Durumu
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Üyelik</span>
                  <span className="text-sm font-medium text-green-600">Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                  <span className="text-sm font-medium text-green-600">Doğrulandı</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Son Giriş</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(user?.lastLogin || Date.now()).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CogIcon className="w-5 h-5" />
                Hızlı İşlemler
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/watchlist"
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 dark:bg-zinc-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
                >
                  <HeartIcon className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Favori Ürünler</span>
                </Link>
                <button 
                  onClick={() => setActiveTab('security')}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 dark:bg-zinc-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
                >
                  <BellIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bildirim Ayarları</span>
                </button>
                <button 
                  onClick={() => setActiveTab('password')}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 dark:bg-zinc-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
                >
                  <LockClosedIcon className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Şifre Değiştir</span>
                </button>
              </div>
            </div>

            {/* Recently Viewed */}
            <RecentlyViewed />
          </div>
        </div>
      </div>
    </main>
  );
} 