import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const { dietary_restrictions } = await request.json();
    if (!Array.isArray(dietary_restrictions)) {
      return NextResponse.json(
        { detail: 'dietary_restrictions must be an array' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dietaryRestrictions: dietary_restrictions,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      dietary_restrictions: updatedUser.dietaryRestrictions,
      created_at: updatedUser.createdAt,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { detail: 'An error occurred updating profile data' },
      { status: 500 }
    );
  }
}
