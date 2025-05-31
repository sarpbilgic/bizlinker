'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  let timeout;

  const handleEnter = () => {
    clearTimeout(timeout);
    setOpen(true);
  };

  const handleLeave = () => {
    timeout = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative z-[9999] inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <UserCircleIcon
        className="w-7 h-7 text-gray-700 dark:text-gray-300 hover:text-gray-500 cursor-pointer"
        onClick={() => router.push('/auth')}
      />

      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f0f0f] text-[#e5e5e5] border border-white/10 rounded-md shadow-lg text-sm z-[9999]">
          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-white/10 transition"
          >
            Profile
          </Link>
          <Link
            href="/watchlist"
            className="block px-4 py-2 hover:bg-white/10 transition"
          >
            Watchlist
          </Link>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-white/10 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
