import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductPageClient from './ProductPageClient';

async function getProductData(id) {
  try {
    await connectDB();
    
    // Ana ürün verilerini getir
    const product = await Product.findById(id);
    if (!product) return null;
    
    // Aynı gruptaki diğer ürünleri getir
    const groupProducts = await Product.find({
      group_id: product.group_id,
      _id: { $ne: product._id }
    }).sort({ price: 1 });

    // Fiyat geçmişini getir (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const priceHistory = await Product.find({
      _id: id,
      createdAt: { $gte: thirtyDaysAgo }
    })
    .sort({ createdAt: 1 })
    .select('price createdAt -_id');

    // Verileri düzenle
    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      image: product.image,
      price: product.price,
      description: product.description,
      brand: product.brand,
      businessName: product.businessName,
      businessUrl: product.businessUrl,
      productUrl: product.productUrl,
      group_title: product.group_title,
      group_slug: product.group_slug,
      group_features: product.group_features || [],
      category_item: product.category_item,
      createdAt: product.createdAt,
      priceHistory: priceHistory.map(p => ({
        price: p.price,
        date: p.createdAt.toISOString().split('T')[0]
      }))
    };

    const formattedGroupProducts = groupProducts.map(p => ({
      id: p._id.toString(),
      name: p.name,
      image: p.image,
      price: p.price,
      businessName: p.businessName,
      productUrl: p.productUrl
    }));

    return {
      product: formattedProduct,
      groupProducts: formattedGroupProducts
    };
  } catch (error) {
    console.error('Failed to fetch product data:', error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const productData = await getProductData(params.id);
  
  if (!productData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }
  
  return <ProductPageClient initialData={productData} />;
} 