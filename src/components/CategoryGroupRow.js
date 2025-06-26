'use client';
import Link from 'next/link';

function uniqueSlideKey(item, index) {
  return `${item.slug}-${index}`;
}

export default function CategoryGroupRow({ title, groups }) {
  return (
    <div className="mb-14 group relative">
      <h2 className="text-xl font-bold mb-4 text-orange-500 dark:text-orange-400">
        Cheapest {title} Prices
      </h2>
      <div className="relative overflow-hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pr-4">
          {groups.map((g, i) => (
            <div
              key={uniqueSlideKey(g, i)}
              className="snap-start min-w-[200px] max-w-[200px] shrink-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-lg shadow-md p-4 h-full hover:scale-[1.02] transition"
            >
              <img
                src={g.image || '/no-image.png'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/fallback.png';
                }}
                alt={g.title}
                className="h-28 w-full object-contain mb-2"
              />
              <p className="text-sm font-semibold line-clamp-2 text-gray-800 dark:text-white mb-1">
                {g.title}
              </p>
              <p className="text-green-600 font-bold text-sm mb-1">
                {typeof g.price === 'number' ? `${g.price.toLocaleString('tr-TR')} ₺` : 'Price Unavailable'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {g.businessName || 'Seller Not Specified'}
              </p>
              <Link
                href={`/group/${g.slug}`}
                className="text-xs text-orange-500 hover:underline"
              >
                Explore
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
