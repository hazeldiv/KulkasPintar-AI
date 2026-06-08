import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await deleteAuthCookie();
    return NextResponse.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { detail: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
