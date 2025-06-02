'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const data = res.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        router.push('/');
      }
    } catch {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-white p-6 rounded-lg shadow-md space-y-4">

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-black dark:text-black">
          E-Posta
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-white text-black dark:text-black"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-black dark:text-black">
          Şifre
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-white text-black dark:black"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-orange-500 mt-3 text-white font-semibold py-2 rounded transition duration-300"
      >
        Giriş Yap
      </button>
    </form>
  );
}
