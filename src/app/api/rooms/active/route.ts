import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const activeRoom = await prisma.sharedRoom.findFirst({
      where: { userId: user.id },
    });

    if (!activeRoom) {
      return NextResponse.json({
        in_room: false,
        room_id: null,
        members: [],
      });
    }

    const membersLinks = await prisma.sharedRoom.findMany({
      where: { roomId: activeRoom.roomId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const members = membersLinks.map((link) => ({
      user_id: link.user.id,
      email: link.user.email,
    }));

    return NextResponse.json({
      in_room: true,
      room_id: activeRoom.roomId,
      members,
    });
  } catch (error) {
    console.error('Fetch active room error:', error);
    return NextResponse.json(
      { detail: 'An error occurred fetching room status' },
      { status: 500 }
    );
  }
}
