import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST(req) {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("DB connected");

    const body = await req.json();

    // Validate input
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters long"),
      userType: z.enum(["admin", "user", "moderator"]), // Example user types
    });

    const parsedBody = registerSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(JSON.stringify({ error: parsedBody.error.errors }), { status: 400 });
    }

    const { email, password, userType } = parsedBody.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      userType,
    });

    console.log("User created:", { email: newUser.email, userType: newUser.userType });
    return new Response(JSON.stringify({ message: "User created" }), { status: 201 });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}