'use client';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 12));
      });
  }, []);

  return (
    <main className="p-6 max-w-7xl mx-auto bg-[#f9fafb] mt-6 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Popüler Ürünler</h2>

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
    </main>
  );
}
