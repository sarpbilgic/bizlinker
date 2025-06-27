import GroupPageClient from './GroupPageClient';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { formatGroup } from '@/lib/group';

async function getGroupData(slug) {
  try {
    await connectDB();
    
    // Ana ürün grubu verilerini getir
    const products = await Product.find({ group_slug: slug }).sort({ price: 1 });
    if (!products.length) return null;
    
    const groupData = formatGroup(products);
    
    // Benzer ürünleri getir
    const regex = new RegExp(groupData.group_title.split(' ').slice(0, 2).join('|'), 'i');
    const related = await Product.aggregate([
      { $match: { group_title: { $regex: regex }, group_slug: { $ne: slug } } },
      {
        $group: {
          _id: '$group_id',
          group_title: { $first: '$group_title' },
          group_slug: { $first: '$group_slug' },
          image: { $first: '$image' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          brand: { $first: '$brand' },
          businessCount: { $sum: 1 }
        }
      },
      { $sort: { minPrice: 1 } },
      { $limit: 8 }
    ]);

    // Fiyat geçmişini getir (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const priceHistory = await Product.find({
      group_id: groupData.group_id,
      createdAt: { $gte: thirtyDaysAgo }
    })
    .sort({ createdAt: 1 })
    .select('price businessName createdAt -_id');

    // Yakındaki mağazaları getir
    const nearbyStores = await Product.aggregate([
      { $match: { group_id: products[0].group_id } },
      {
        $group: {
          _id: '$businessName',
          location: { $first: '$location' },
          price: { $first: '$price' },
          distance: { $first: '$distance' }
        }
      }
    ]);

    return {
      ...groupData,
      related,
      priceHistory: priceHistory.map(p => ({
        price: p.price,
        businessName: p.businessName,
        date: p.createdAt.toISOString().split('T')[0]
      })),
      nearbyStores
    };
  } catch (error) {
    console.error('Failed to fetch group data:', error);
    return null;
  }
}

export default async function GroupPage({ params }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const groupData = await getGroupData(decodedSlug);
  
  if (!groupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }
  
  return <GroupPageClient initialData={groupData} slug={decodedSlug} />;
}
