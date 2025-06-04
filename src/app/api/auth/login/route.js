import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withDB } from '@/lib/api-utils';

export const POST = withDB(async (req) => {
  try {

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in env');
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
