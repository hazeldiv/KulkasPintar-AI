import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchUserInventory, getUserActiveRoom } from '@/lib/inventory-helper';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const inventory = await fetchUserInventory(user.id);
    
    // Map database fields to the API schema format expected by the frontend
    const mappedInventory = inventory.map((item) => ({
      id: item.id,
      user_id: item.userId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      added_at: item.addedAt.toISOString(),
      expires_at: item.expiresAt ? item.expiresAt.toISOString() : null,
    }));

    return NextResponse.json(mappedInventory);
  } catch (error) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json(
      { detail: 'An error occurred fetching inventory data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, quantity, unit, category, expires_at } = body;

    if (!name || quantity === undefined) {
      return NextResponse.json(
        { detail: 'Name and quantity are required' },
        { status: 400 }
      );
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty)) {
      return NextResponse.json(
        { detail: 'Quantity must be a number' },
        { status: 400 }
      );
    }

    const expiresAtDate = expires_at ? new Date(expires_at) : null;

    // Check if we already have an item with the same name in the current room/user inventory
    const activeRoom = await getUserActiveRoom(user.id);
    let existingItem = null;

    if (activeRoom) {
      const members = await prisma.sharedRoom.findMany({
        where: { roomId: activeRoom.roomId },
        select: { userId: true },
      });
      const userIds = members.map((m) => m.userId);

      existingItem = await prisma.inventoryItem.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          userId: { in: userIds },
        },
      });
    } else {
      existingItem = await prisma.inventoryItem.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          userId: user.id,
        },
      });
    }

    if (existingItem) {
      // Merge quantity
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parsedQty,
          // Update expiration if the new expiration is provided
          ...(expiresAtDate ? { expiresAt: expiresAtDate } : {}),
        },
      });

      return NextResponse.json({
        id: updatedItem.id,
        user_id: updatedItem.userId,
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        unit: updatedItem.unit,
        category: updatedItem.category,
        added_at: updatedItem.addedAt.toISOString(),
        expires_at: updatedItem.expiresAt ? updatedItem.expiresAt.toISOString() : null,
      });
    }

    // Create new item
    const newItem = await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        name,
        quantity: parsedQty,
        unit: unit || 'pcs',
        category: category || 'Others',
        expiresAt: expiresAtDate,
      },
    });

    return NextResponse.json({
      id: newItem.id,
      user_id: newItem.userId,
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      category: newItem.category,
      added_at: newItem.addedAt.toISOString(),
      expires_at: newItem.expiresAt ? newItem.expiresAt.toISOString() : null,
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    return NextResponse.json(
      { detail: 'An error occurred adding inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const activeRoom = await getUserActiveRoom(user.id);

    if (activeRoom) {
      const members = await prisma.sharedRoom.findMany({
        where: { roomId: activeRoom.roomId },
        select: { userId: true },
      });
      const userIds = members.map((m) => m.userId);

      await prisma.$transaction([
        prisma.inventoryItem.deleteMany({
          where: { userId: { in: userIds } },
        }),
        prisma.recipe.deleteMany({
          where: { roomId: activeRoom.roomId },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.inventoryItem.deleteMany({
          where: { userId: user.id },
        }),
        prisma.recipe.deleteMany({
          where: { userId: user.id, roomId: null },
        }),
      ]);
    }

    return NextResponse.json({ message: 'All inventory items and related recipes cleared' });
  } catch (error) {
    console.error('Clear inventory error:', error);
    return NextResponse.json(
      { detail: 'An error occurred clearing inventory' },
      { status: 500 }
    );
  }
}
