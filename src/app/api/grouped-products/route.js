import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  // Filtreleri al
  const filters = getFiltersFromQuery(searchParams);

  let sortStage = {};
  const sort = searchParams.get('sort');

  
  if (sort === 'minPrice_asc') sortStage = { minPrice: 1 };
  else if (sort === 'maxPrice_desc') sortStage = { maxPrice: -1 };
  else if (sort === 'count_desc') sortStage = { count: -1 };
  else sortStage = { count: -1 }; // varsayılan

  // Aggregation pipeline
  const pipeline = [
    { $match: { group_id: { $ne: null }, ...filters } },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        brands: { $addToSet: '$brand' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        count: { $sum: 1 },
        businesses: {
          $push: {
            businessName: '$businessName',
            price: '$price',
            productUrl: '$productUrl'
          }
        }
      }
    },
    ...(Object.keys(sortStage).length > 0 ? [{ $sort: sortStage }] : []),
    { $limit: 100 }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
});
