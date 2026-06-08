import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchUserRecipes } from '@/lib/recipe-helper';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const recipes = await fetchUserRecipes(user.id);
    
    // Map database camelCase fields to snake_case for frontend compatibility
    const mappedRecipes = recipes.map((r) => ({
      name: r.name,
      prep_time: r.prepTime,
      ingredients_used: r.ingredientsUsed,
      instructions: r.instructions,
    }));

    return NextResponse.json({ recipes: mappedRecipes });
  } catch (error: any) {
    console.error('Fetch recipes error:', error);
    return NextResponse.json(
      { detail: error.message || 'An error occurred fetching recipes' },
      { status: 500 }
    );
  }
}
