import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import User from '@/models/User';
import Product from '@/models/Product';
import { z } from 'zod';

// Get recently viewed products
export const GET = withDB(async (req) => {
  try {
    const userData = authenticate(req);
    if (!userData) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById(userData.id)
      .select('recentlyViewed')
      .populate({
        path: 'recentlyViewed',
        model: Product,
        select: 'title image price businessName productUrl group_id group_title'
      });

    return NextResponse.json({
      success: true,
      products: user.recentlyViewed || []
    });
  } catch (err) {
    console.error('GET RECENTLY VIEWED ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
});

// Add a product to recently viewed
export const POST = withDB(async (req) => {
  try {
    const userData = authenticate(req);
    if (!userData) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const schema = z.object({
      productId: z.string().min(1, "Product ID is required")
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors.map(err => err.message).join(', '), 400);
    }

    const { productId } = parsed.data;

    // Remove duplicate if exists, then add to front (max 20 items, newest first)
    await User.findByIdAndUpdate(
      userData.id,
      {
        $pull: { recentlyViewed: productId }
      }
    );

    await User.findByIdAndUpdate(
      userData.id,
      {
        $push: {
          recentlyViewed: {
            $each: [productId],
            $position: 0,
            $slice: 20
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Product added to recently viewed'
    });
  } catch (err) {
    console.error('ADD RECENTLY VIEWED ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
}); 