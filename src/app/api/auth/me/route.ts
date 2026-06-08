import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      dietary_restrictions: user.dietaryRestrictions,
      created_at: user.createdAt,
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    return NextResponse.json(
      { detail: 'An error occurred fetching user data' },
      { status: 500 }
    );
  }
}
