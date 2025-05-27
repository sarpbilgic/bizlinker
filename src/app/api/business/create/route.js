import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import { verifyToken } from "@/utils/auth";
import { z } from "zod";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    const data = await req.json();

    // ✅ Validation
    const schema = z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors }), { status: 400 });
    }

    await connectDB();

    const business = await Business.create({
      ...parsed.data,
      userId: user.id || user._id,
    });

    return new Response(JSON.stringify(business), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error creating business:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
