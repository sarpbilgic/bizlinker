'use client';

import Link from 'next/link';

export default function CompareGroupCard({ group }) {
  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl shadow-sm mb-8 p-4">
      <h2 className="text-lg font-bold mb-4">En Ucuz {group.title} Fiyatları</h2>
      <div className="divide-y divide-gray-100 dark:divide-white/10">
        {group.products.map((product) => (
          <div key={product._id} className="flex items-center gap-4 py-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-contain rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{product.brand}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{product.businessName}</p>
            </div>
            <div className="text-right">
              <p className="text-green-600 font-semibold">{product.price.toLocaleString()} ₺</p>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Git
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}