'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setUser(token ? { name: 'User' } : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto flex items-center justify-between p-4 flex-wrap">
        <Link href="/" className="text-2xl font-bold">BizLinker</Link>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Link href="/watchlist" className="hover:text-blue-600">Watchlist</Link>
          {user ? (
            <button onClick={handleLogout} className="hover:text-red-600">Logout</button>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Login</Link>
              <Link href="/register" className="hover:text-blue-600">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
)}