'use client';

import { useState } from 'react';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function TestDropdown() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen  flex justify-center items-start pt-10">
      <ProfileDropdown />
    </div>
  );
}
