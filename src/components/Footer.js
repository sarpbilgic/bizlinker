'use client';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/business/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
        {categories.map((cat) => (
          <a key={cat} href={`/?category=${cat}`} className="hover:underline capitalize truncate">
            {cat}
          </a>
        ))}
      </div>
    </footer>
  );
}