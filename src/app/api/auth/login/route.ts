import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await verifyPassword(password, user.hashedPassword))) {
      return NextResponse.json(
        { detail: 'Incorrect email or password' },
        { status: 401 }
      );
    }

    const token = signToken({ user_id: user.id });
    await setAuthCookie(token);

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
