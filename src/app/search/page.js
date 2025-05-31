'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        const unique = [];
        const seen = new Set();
        data.forEach((p) => {
          if (!seen.has(p.productUrl)) {
            seen.add(p.productUrl);
            unique.push(p);
          }
        });
        setProducts(unique);
      });
  }, [query]);

  return (
    <main className="p-6 max-w-7xl mx-auto bg-[#f9fafb] min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Arama Sonuçları: <span className="text-orange-600">{query}</span>
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-600">Sonuç bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="rounded-xl border border-gray-200 p-4 bg-white shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-contain mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.brand}</p>
              <p className="text-md font-bold text-orange-600">{product.price}₺</p>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Ürüne Git
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
