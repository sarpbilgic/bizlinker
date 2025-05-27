'use client';

import { useState } from 'react';
import LoginForm from '@components/LoginForm';
import RegisterForm from '@components/RegisterForm';

export default function AuthPage() {
  const [tab, setTab] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f0f0f] text-black dark:text-white px-4">
      <div className="bg-gray-100 dark:bg-[#1a1a1a] p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Sekmeler */}
        <div className="flex justify-between mb-6 border-b border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setTab('login')}
            className={`pb-2 px-4 font-semibold ${
              tab === 'login' ? 'border-b-2 border-blue-800 text-gray-300' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`pb-2 px-4 font-semibold  ${
              tab === 'register' ? 'border-b-2 border-blue-800 text-gray-300' : 'text-gray-500' 
            }`}
          >
            Register
          </button>
        </div>

        {/* Formlar */}
        <div className="transition-all duration-300">
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
