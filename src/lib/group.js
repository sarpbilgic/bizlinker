export function formatGroup(products) {
  if (!products?.length) return null;
  const base = products[0];
  return {
    group_id: base.group_id,
    group_title: base.group_title,
    group_slug: base.group_slug,
    group_title_simplified: base.group_title_simplified,
    category_slug: base.category_slug,
    category_item: base.category_item,
    image: base.image || '/no-image.png',
    group_features: base.group_features || [],
    is_unique_group: base.is_unique_group || false,
    minPrice: Math.min(...products.map(p => p.price)),
    maxPrice: Math.max(...products.map(p => p.price)),
    brands: [...new Set(products.map(p => p.brand).filter(Boolean))],
    businesses: products
      .map(p => ({
        businessName: p.businessName,
        businessUrl: p.businessUrl,
        price: p.price,
        productUrl: p.productUrl,
        image: p.image,
        createdAt: p.createdAt,
        brand: p.brand,
      }))
      .sort((a, b) => a.price - b.price),
    count: products.length,
  };
}

export async function getGroup({ slug, id, Product }) {
  const query = slug ? { group_slug: slug } : id ? { group_id: id } : null;
  if (!query) {
    return { status: 400, body: { error: 'slug veya id parametresi gerekli.' } };
  }
  const products = await Product.find(query).sort({ price: 1 });
  if (!products.length) {
    return { status: 404, body: { error: 'Ürün grubu bulunamadı.' } };
  }
  return { status: 200, body: formatGroup(products) };
}
