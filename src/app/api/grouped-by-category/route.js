
import Product from '@/models/Product';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {

  const categories = await Product.aggregate([
    {
      $group: {
        _id: "$category_slug",
        categoryTitle: { $first: "$main_category" },
        groups: {
          $push: {
            _id: "$group_id",
            title: "$group_title_simplified",
            slug: "$group_slug",
            image: "$image",
            price: "$price",
            count: 1,
            businessName: "$businessName",
          }
        }
      }
    },
    { $limit: 5 } // istersen filtre eklenebilir
  ]);

  return Response.json(categories);
});
