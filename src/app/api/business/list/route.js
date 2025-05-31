import { connectDB } from '@/lib/mongodb';
import Business from '@/models/Business';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { category, priceMin = 0, priceMax = 10000, userLocation, sort } = body;

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return new Response(JSON.stringify({ error: 'Konum gerekli' }), {
        status: 400,
      });
    }

    const filter = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat],
          },
          $maxDistance: 10000,
        },
      },
    };

    if (category) filter.category = category;

    let businesses = await Business.find(filter).lean();

  
    if (sort === 'price') {
      businesses = businesses
        .map((biz) => {
          const cheapestService = biz.services?.sort((a, b) => a.price - b.price)[0];
          return {
            ...biz,
            minPrice: cheapestService?.price ?? Infinity,
          };
        })
        .filter((biz) => biz.minPrice >= priceMin && biz.minPrice <= priceMax)
        .sort((a, b) => a.minPrice - b.minPrice);
    }

    return new Response(JSON.stringify(businesses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('List error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
}
