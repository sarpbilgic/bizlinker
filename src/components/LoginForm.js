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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md space-y-4">

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0f0f0f] text-black dark:text-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0f0f0f] text-black dark:text-white"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-800 hover:bg-blue-900 mt-3 text-white font-semibold py-2 rounded transition duration-300"
      >
        Login
      </button>
    </form>
  );
}
