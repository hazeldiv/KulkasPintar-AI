import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchUserInventory } from '@/lib/inventory-helper';
import { analyzeFridgeImage } from '@/lib/gemini-service';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { detail: 'Could not validate credentials. Please log in.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const strictMatch = formData.get('strict_match') === 'true';
    const saveTheFood = formData.get('save_the_food') === 'true';
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { detail: 'No image file uploaded' },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = imageFile.type || 'image/jpeg';

    // Fetch user inventory for analysis context
    const inventory = await fetchUserInventory(user.id);
    const inventoryContext = inventory.map((item) => ({
      name: item.name,
      added_at: item.addedAt.toISOString(),
    }));

    const result = await analyzeFridgeImage(
      imageBuffer,
      mimeType,
      user.dietaryRestrictions,
      inventoryContext,
      strictMatch,
      saveTheFood
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analyze fridge error:', error);
    return NextResponse.json(
      { detail: error.message || 'An error occurred during analysis' },
      { status: 502 }
    );
  }
}
