import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { verifyToken } from "@/utils/auth";

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
    await connectDB();

    const business = await Business.create({
      ...data,
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
      headers: { "Content-Type": "application/json" },
    });
  }
}
