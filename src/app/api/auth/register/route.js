import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { withDB } from '@/lib/api-utils';

export const POST = withDB(async (req) => {
  try {

    const body = await req.json();

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      userType: z.enum(['consumer', 'business']),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors }), {
        status: 400,
      });
    }

    const { email, password, userType } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      userType,
    });

    return new Response(JSON.stringify({ message: 'User created' }), {
      status: 201,
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
});
