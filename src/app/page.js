'use client';
import { useEffect, useState } from 'react';
import CategoryGroupRow from '@/components/CategoryGroupRow';

export default function HomePage() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetch('/api/grouped-by-category')
      .then((res) => res.json())
      .then((data) => setSections(data));
  }, []);

  return (
    <main className="p-6 max-w-7xl mx-auto bg-white dark:bg-[#0f0f0f]">
      {sections.map((section, i) => (
        <CategoryGroupRow key={i} title={section.categoryTitle} groups={section.groups} />
      ))}
    </main>
  );
}