'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import '@app/globals.css';

export default function Navbar() {
    return (
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">BizLinker</a>
          <div className="space-x-4">
            <a href="/explore" className="text-gray-600 hover:text-blue-600">Explore</a>
            <a href="/businesses" className="text-gray-600 hover:text-blue-600">Businesses</a>
            <a href="/login" className="text-gray-600 hover:text-blue-600">Login</a>
          </div>
        </div>
      </nav>
    );
  }
  