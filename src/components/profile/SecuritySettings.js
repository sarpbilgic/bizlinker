'use client';

import { useState, useEffect } from 'react';
import { ShieldCheckIcon, BellIcon, TagIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function SecuritySettings() {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    priceAlerts: true,
    stockAlerts: true,
    emailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/user/security');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const newSettings = {
        ...settings,
        [key]: !settings[key]
      };

      const res = await fetch('/api/user/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
        setSuccess('Ayarlar başarıyla güncellendi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      setError('Güncelleme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-6 w-1/4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-6 w-12 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6" />
          Güvenlik Ayarları
        </h2>
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

        <div className="space-y-6">
          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">İki Faktörlü Doğrulama</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hesabınızı daha güvenli hale getirin</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.twoFactorEnabled}
                onChange={() => handleToggle('twoFactorEnabled')}
                disabled={saving}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Login Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Giriş Bildirimleri</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Yeni cihazlardan giriş yapıldığında bildirim alın</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.loginNotifications}
                onChange={() => handleToggle('loginNotifications')}
                disabled={saving}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Price Alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <TagIcon className="w-5 h-5 text-green-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Fiyat Alarmları</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Takip ettiğiniz ürünlerin fiyatları değiştiğinde bildirim alın</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.priceAlerts}
                onChange={() => handleToggle('priceAlerts')}
                disabled={saving}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Stock Alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Stok Alarmları</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Takip ettiğiniz ürünler stoka girdiğinde bildirim alın</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.stockAlerts}
                onChange={() => handleToggle('stockAlerts')}
                disabled={saving}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Bildirimleri</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Önemli güncellemeler ve fırsatlar için email alın</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                disabled={saving}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 