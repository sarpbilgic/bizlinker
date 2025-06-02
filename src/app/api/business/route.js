import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const schema = z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const business = new Business(parsed.data);
    await business.save();

    return NextResponse.json({ message: "Business created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Business creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
