import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";

export async function POST(req) {
  try {
    const { category, userLocation } = await req.json();

    if (!userLocation?.lat || !userLocation?.lng) {
      return new Response(JSON.stringify({ error: "Missing location data" }), { status: 400 });
    }

    await connectDB();

    const businesses = await Business.find({
      category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLocation.lng, userLocation.lat],
          },
          $maxDistance: 10000, // 10 km
        },
      },
    });

    return new Response(JSON.stringify(businesses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("List error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
