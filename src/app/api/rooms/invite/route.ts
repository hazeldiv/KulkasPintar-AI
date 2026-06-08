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

    const activeRoom = await prisma.sharedRoom.findFirst({
      where: { userId: user.id },
    });

    if (!activeRoom) {
      return NextResponse.json(
        { detail: 'You are not in an active room. Connect to a room first to invite members.' },
        { status: 400 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ detail: 'Email is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!targetUser) {
      return NextResponse.json(
        { detail: `User with email ${email} not found. They must register an account first.` },
        { status: 404 }
      );
    }

    const inSameRoom = await prisma.sharedRoom.findFirst({
      where: {
        userId: targetUser.id,
        roomId: activeRoom.roomId,
      },
    });

    if (inSameRoom) {
      return NextResponse.json({ message: `${email} is already in the room` });
    }

    // Remove target user from any other rooms first
    await prisma.sharedRoom.deleteMany({
      where: { userId: targetUser.id },
    });

    // Add target user to current user's active room
    await prisma.sharedRoom.create({
      data: {
        roomId: activeRoom.roomId,
        userId: targetUser.id,
      },
    });

    return NextResponse.json({
      message: `Successfully added ${email} to room ${activeRoom.roomId}`,
    });
  } catch (error) {
    console.error('Invite to room error:', error);
    return NextResponse.json(
      { detail: 'An error occurred inviting user to room' },
      { status: 500 }
    );
  }
}
