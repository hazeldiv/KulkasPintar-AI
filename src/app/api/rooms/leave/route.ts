import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    await prisma.sharedRoom.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ message: 'Successfully left the room' });
  } catch (error) {
    console.error('Leave room error:', error);
    return NextResponse.json(
      { detail: 'An error occurred leaving room' },
      { status: 500 }
    );
  }
}
