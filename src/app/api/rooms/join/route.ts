import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const { room_id } = await request.json();
    if (!room_id) {
      return NextResponse.json({ detail: 'room_id is required' }, { status: 400 });
    }

    const roomSlug = room_id.trim().toLowerCase();

    // Check if already in this room
    const existing = await prisma.sharedRoom.findFirst({
      where: { userId: user.id, roomId: roomSlug },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        room_id: existing.roomId,
        user_id: existing.userId,
        joined_at: existing.joinedAt.toISOString(),
      });
    }

    // Delete user from other rooms first
    await prisma.sharedRoom.deleteMany({
      where: { userId: user.id },
    });

    const newRoomLink = await prisma.sharedRoom.create({
      data: {
        roomId: roomSlug,
        userId: user.id,
      },
    });

    return NextResponse.json({
      id: newRoomLink.id,
      room_id: newRoomLink.roomId,
      user_id: newRoomLink.userId,
      joined_at: newRoomLink.joinedAt.toISOString(),
    });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json(
      { detail: 'An error occurred joining room' },
      { status: 500 }
    );
  }
}
