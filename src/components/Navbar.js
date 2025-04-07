'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          BizLinker
        </Link>

        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <ul className="hidden md:flex space-x-6 text-sm font-medium">
          <li><Link href="/" className="hover:text-blue-500">Home</Link></li>
          <li><Link href="/about" className="hover:text-blue-500">About</Link></li>
          <li><Link href="/services" className="hover:text-blue-500">Services</Link></li>
          <li><Link href="/contact" className="hover:text-blue-500">Contact</Link></li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col space-y-2 text-sm font-medium">
            <li><Link href="/" className="hover:text-blue-500" onClick={toggleMenu}>Home</Link></li>
            <li><Link href="/about" className="hover:text-blue-500" onClick={toggleMenu}>About</Link></li>
            <li><Link href="/services" className="hover:text-blue-500" onClick={toggleMenu}>Services</Link></li>
            <li><Link href="/contact" className="hover:text-blue-500" onClick={toggleMenu}>Contact</Link></li>
          </ul>
        </div>
      )}
    </header>
  )
}
