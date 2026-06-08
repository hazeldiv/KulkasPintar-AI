import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasInventoryPermission } from '@/lib/inventory-helper';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return NextResponse.json({ detail: 'Invalid item ID' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ detail: 'Item not found' }, { status: 404 });
    }

    const hasPerm = await hasInventoryPermission(user.id, item.userId);
    if (!hasPerm) {
      return NextResponse.json(
        { detail: 'Not authorized to edit this item' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, quantity, unit, category, expires_at } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) {
      const parsedQty = parseFloat(quantity);
      if (isNaN(parsedQty)) {
        return NextResponse.json({ detail: 'Quantity must be a number' }, { status: 400 });
      }
      updateData.quantity = parsedQty;
    }
    if (unit !== undefined) updateData.unit = unit;
    if (category !== undefined) updateData.category = category;
    if (expires_at !== undefined) {
      updateData.expiresAt = expires_at ? new Date(expires_at) : null;
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: updateData,
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
  } catch (error) {
    console.error('Update inventory item error:', error);
    return NextResponse.json(
      { detail: 'An error occurred updating inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return NextResponse.json({ detail: 'Invalid item ID' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ detail: 'Item not found' }, { status: 404 });
    }

    const hasPerm = await hasInventoryPermission(user.id, item.userId);
    if (!hasPerm) {
      return NextResponse.json(
        { detail: 'Not authorized to delete this item' },
        { status: 403 }
      );
    }

    // Find user's active room
    const activeRoom = await prisma.sharedRoom.findFirst({
      where: { userId: user.id },
    });

    // Fetch recipes for the user/room to check for dependencies
    const recipes = await prisma.recipe.findMany({
      where: activeRoom
        ? { roomId: activeRoom.roomId }
        : { userId: user.id, roomId: null },
    });

    const itemNameLower = item.name.toLowerCase();
    const recipeIdsToDelete = recipes
      .filter((r) =>
        r.ingredientsUsed.some((ing) => ing.toLowerCase() === itemNameLower)
      )
      .map((r) => r.id);

    // Perform atomic deletion of inventory item and related recipes
    await prisma.$transaction([
      prisma.inventoryItem.delete({
        where: { id: itemId },
      }),
      ...(recipeIdsToDelete.length > 0
        ? [
            prisma.recipe.deleteMany({
              where: { id: { in: recipeIdsToDelete } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    return NextResponse.json(
      { detail: 'An error occurred deleting inventory item' },
      { status: 500 }
    );
  }
}
