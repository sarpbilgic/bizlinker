'use client'

import { useState } from 'react'
import '@app/globals.css';
export default function Footer() {
    return (
      <footer className="bg-gray-100 py-6 mt-8">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} BizLinker. All rights reserved.
        </div>
      </footer>
    );
  }
  