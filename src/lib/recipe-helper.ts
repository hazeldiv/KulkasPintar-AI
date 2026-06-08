import { prisma } from './prisma';
import { getUserActiveRoom } from './inventory-helper';

export interface RecipeData {
  name: string;
  prep_time: string;
  ingredients_used: string[];
  instructions: string[];
}

export async function fetchUserRecipes(userId: number) {
  const activeRoom = await getUserActiveRoom(userId);
  if (activeRoom) {
    return prisma.recipe.findMany({
      where: { roomId: activeRoom.roomId },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    return prisma.recipe.findMany({
      where: { userId, roomId: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export async function saveUserRecipes(userId: number, recipes: RecipeData[]) {
  const activeRoom = await getUserActiveRoom(userId);
  const roomId = activeRoom ? activeRoom.roomId : null;

  // Transaction: delete existing recipes and insert new ones
  return prisma.$transaction([
    prisma.recipe.deleteMany({
      where: activeRoom ? { roomId } : { userId, roomId: null },
    }),
    prisma.recipe.createMany({
      data: recipes.map((r) => ({
        userId,
        roomId,
        name: r.name,
        prepTime: r.prep_time,
        ingredientsUsed: r.ingredients_used,
        instructions: r.instructions,
      })),
    }),
  ]);
}
