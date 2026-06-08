import { prisma } from './prisma';

export async function getUserActiveRoom(userId: number) {
  return prisma.sharedRoom.findFirst({
    where: { userId },
  });
}

export async function fetchUserInventory(userId: number) {
  const activeRoom = await getUserActiveRoom(userId);
  
  if (activeRoom) {
    // Get all users in this room
    const members = await prisma.sharedRoom.findMany({
      where: { roomId: activeRoom.roomId },
      select: { userId: true },
    });
    
    const userIds = members.map((m) => m.userId);
    
    return prisma.inventoryItem.findMany({
      where: { userId: { in: userIds } },
      orderBy: { addedAt: 'desc' },
    });
  } else {
    return prisma.inventoryItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
  }
}

export async function hasInventoryPermission(userId: number, ownerId: number): Promise<boolean> {
  if (userId === ownerId) return true;

  const activeRoom = await getUserActiveRoom(userId);
  if (!activeRoom) return false;

  const ownerRoom = await prisma.sharedRoom.findFirst({
    where: {
      userId: ownerId,
      roomId: activeRoom.roomId,
    },
  });

  return !!ownerRoom;
}

