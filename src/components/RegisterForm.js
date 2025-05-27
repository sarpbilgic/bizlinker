'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('consumer');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', {
        email,
        password,
        userType,
      });
      if (res.status === 201) {
        router.push('/');
      }
    } catch (error) {
      alert(
        error.response?.data?.error?.[0]?.message ||
        error.response?.data?.error ||
        'Registration failed'
      );
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

      <div className="space-y-1">
        <label htmlFor="userType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          User Type
        </label>
        <select
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0f0f0f] text-black dark:text-white"
        >
          <option value="consumer">Consumer</option>
          <option value="business">Business</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded transition duration-300 mt-3"
      >
        Register
      </button>
    </form>
  );
}
