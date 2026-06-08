import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { detail: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        dietaryRestrictions: [],
      },
    });

    const token = signToken({ user_id: user.id });
    await setAuthCookie(token);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      dietary_restrictions: user.dietaryRestrictions,
      created_at: user.createdAt,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { detail: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
