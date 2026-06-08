import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchUserInventory } from '@/lib/inventory-helper';
import { generateRecipesFromIngredients } from '@/lib/gemini-service';

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
    const { strict_match, save_the_food } = body;

    const strictMatch = strict_match === true;
    const saveTheFood = save_the_food === true;

    // Fetch user inventory for recipe generation context
    const inventory = await fetchUserInventory(user.id);
    const inventoryContext = inventory.map((item) => ({
      name: item.name,
      added_at: item.addedAt.toISOString(),
    }));

    if (inventoryContext.length === 0) {
      return NextResponse.json(
        { detail: 'Cannot generate recipes with an empty inventory. Log some ingredients first!' },
        { status: 400 }
      );
    }

    const recipes = await generateRecipesFromIngredients(
      user.dietaryRestrictions,
      inventoryContext,
      strictMatch,
      saveTheFood
    );

    return NextResponse.json({ recipes });
  } catch (error: any) {
    console.error('Generate recipes error:', error);
    return NextResponse.json(
      { detail: error.message || 'An error occurred during recipe generation' },
      { status: 502 }
    );
  }
}
