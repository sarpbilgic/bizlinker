import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ImageWithFallback from '@/components/ImageWithFallback';

export async function generateMetadata({ params }) {
  return { title: `${decodeURIComponent(params.slug)} | Fiyat Karşılaştırma` };
}

export default async function GroupPage({ params }) {
  await connectDB();
  const slug = decodeURIComponent(params.slug);
  const groupProducts = await Product.find({ group_slug: slug }).sort({ price: 1 });

  if (!groupProducts?.length) return <div className="p-10 text-center text-lg">Ürün bulunamadı.</div>;

  const title = groupProducts[0].group_title;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-orange-500 mb-8">{title} Fiyatları</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {groupProducts.map((p) => (
          <div
            key={p._id.toString()}
            className="flex items-start gap-4 border border-gray-200 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-zinc-900 shadow-sm"
          >
            <ImageWithFallback
              src={p.image || '/no-image.png'}
              alt={p.name}
              className="w-32 h-32 object-contain border rounded"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-white">
                  {p.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Satıcı: <span className="font-medium text-black dark:text-white">{p.businessName}</span>
                </p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-green-600 font-bold text-xl">
                  {typeof p.price === 'number' ? `${p.price.toLocaleString('tr-TR')} ₺` : 'Fiyat Yok'}
                </p>
                <a
                  href={p.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                >
                  Siteye Git
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
