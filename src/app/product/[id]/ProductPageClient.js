'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProductPageClient({ initialData }) {
  const { product, groupProducts } = initialData;
  const [selectedImage, setSelectedImage] = useState(product.image);

  // Fiyat geçmişi grafiği için veri ve ayarlar
  const chartData = {
    labels: product.priceHistory.map(p => p.date),
    datasets: [
      {
        label: 'Price History',
        data: product.priceHistory.map(p => p.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '30-Day Price History'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '₺' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Ana ürün detayları */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sol taraf - Resim */}
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Sağ taraf - Ürün bilgileri */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {product.name}
                </h1>
                
                <div className="mb-6">
                  <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                    ₺{product.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    from {product.businessName}
                  </p>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Product Details</h2>
                  <dl className="grid grid-cols-1 gap-2">
                    {product.brand && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400">Brand</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{product.brand}</dd>
                      </>
                    )}
                    {product.category_item && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{product.category_item}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>

              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Visit Store
              </a>
            </div>
          </div>
        </div>

        {/* Fiyat geçmişi grafiği */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Price History</h2>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Gruptaki diğer ürünler */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Other Products in {product.group_title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupProducts.map((groupProduct) => (
              <Link
                key={groupProduct.id}
                href={`/product/${groupProduct.id}`}
                className="block bg-gray-50 dark:bg-zinc-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square rounded overflow-hidden mb-4">
                  <Image
                    src={groupProduct.image}
                    alt={groupProduct.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {groupProduct.name}
                </h3>
                <p className="text-orange-600 dark:text-orange-400 font-semibold">
                  ₺{groupProduct.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {groupProduct.businessName}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 