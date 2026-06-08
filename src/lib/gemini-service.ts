import { GoogleGenAI } from '@google/genai';

export interface ScanIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  days_to_expiration: number;
}

export interface ScanRecipe {
  name: string;
  ingredients_used: string[];
  instructions: string[];
  prep_time: string;
}

export interface AnalyzeResponse {
  ingredients: ScanIngredient[];
  recipes: ScanRecipe[];
}

function handleGeminiError(error: unknown): never {
  console.error('Gemini API execution failed:', error);
  const errStr = error instanceof Error ? error.message : String(error);
  if (
    errStr.includes('high demand') ||
    errStr.includes('503') ||
    errStr.includes('UNAVAILABLE')
  ) {
    throw new Error('AI server is busy. Please try again later.');
  }
  throw new Error(`Gemini API Error: ${error}`);
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const stripped = apiKey.trim();
  if (!stripped || stripped === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey: stripped });
  } catch (error) {
    console.error('Failed to initialize Gemini Client:', error);
    throw new Error(`Failed to initialize Gemini Client: ${error}`);
  }
}

function generateMockData(
  dietaryRestrictions: string[],
  inventoryItems: string[] = [],
  strictMatch: boolean = false,
  oldestItems: string[] = []
): AnalyzeResponse {
  const isVegetarian = dietaryRestrictions.some((r) =>
    ['vegetarian', 'vegan'].includes(r.toLowerCase())
  );
  const isHalal = dietaryRestrictions.some((r) => r.toLowerCase() === 'halal');
  const hasPeanutAllergy = dietaryRestrictions.some(
    (r) => r.toLowerCase().includes('peanut') || r.toLowerCase().includes('nut')
  );

  let detectedNames: string[] = [];

  if (strictMatch && inventoryItems.length > 0) {
    detectedNames = inventoryItems.slice(0, 5);
  } else {
    detectedNames = ['Eggs', 'Milk', 'Tomatoes', 'Cheddar Cheese'];
    if (!isVegetarian) {
      detectedNames.push('Chicken Breast');
    } else {
      detectedNames.push('Tofu');
    }

    if (!hasPeanutAllergy) {
      detectedNames.push('Peanut Butter');
    } else {
      detectedNames.push('Avocado');
    }
  }

  const categoryMap: Record<string, string> = {
    Eggs: 'Dairy/Eggs',
    Milk: 'Dairy/Eggs',
    'Cheddar Cheese': 'Dairy/Eggs',
    Tomatoes: 'Vegetables',
    Tofu: 'Proteins',
    'Chicken Breast': 'Proteins',
    'Peanut Butter': 'Pantry',
    Avocado: 'Fruits',
  };

  const unitMap: Record<string, string> = {
    Eggs: 'pcs',
    Milk: 'ml',
    'Cheddar Cheese': 'grams',
    Tomatoes: 'pcs',
    Tofu: 'grams',
    'Chicken Breast': 'grams',
    'Peanut Butter': 'grams',
    Avocado: 'pcs',
  };

  const quantityMap: Record<string, number> = {
    Eggs: 6,
    Milk: 500,
    'Cheddar Cheese': 200,
    Tomatoes: 3,
    Tofu: 300,
    'Chicken Breast': 400,
    'Peanut Butter': 250,
    Avocado: 2,
  };

  const ingredients: ScanIngredient[] = detectedNames.map((name) => {
    const cat = categoryMap[name] || 'Others';
    const unit = unitMap[name] || 'pcs';
    const qty = quantityMap[name] || 1.0;
    const days = ['Milk', 'Chicken Breast'].includes(name)
      ? 3
      : ['Eggs', 'Tofu', 'Tomatoes'].includes(name)
      ? 7
      : 15;

    return {
      name,
      quantity: qty,
      unit,
      category: cat,
      days_to_expiration: days,
    };
  });

  const recipes: ScanRecipe[] = [];

  // Recipe 1: scramble
  const scrambleName = detectedNames.includes('Eggs') ? 'Quick Egg Scramble' : 'Savory Tofu Scramble';
  const scrambleIng = [detectedNames.includes('Eggs') ? 'Eggs' : 'Tofu', 'Tomatoes'];
  if (detectedNames.includes('Cheddar Cheese')) {
    scrambleIng.push('Cheddar Cheese');
  }
  recipes.push({
    name: scrambleName,
    ingredients_used: scrambleIng,
    instructions: [
      'Chop the tomatoes into small cubes.',
      'Heat a non-stick pan over medium heat with a splash of oil.',
      'Sauté the tomatoes for 2 minutes until slightly soft.',
      'Whisk the eggs in a bowl (or crumble the tofu) and pour into the pan.',
      'Gently stir until cooked through. Fold in shredded cheese at the end if desired.',
    ],
    prep_time: '10 mins',
  });

  // Recipe 2: Protein Bowl
  const bowlName = 'Kulkas Starter Protein Bowl';
  const bowlIng = [detectedNames.includes('Chicken Breast') ? 'Chicken Breast' : 'Tofu'];
  if (detectedNames.includes('Tomatoes')) bowlIng.push('Tomatoes');
  if (detectedNames.includes('Avocado')) bowlIng.push('Avocado');
  recipes.push({
    name: bowlName,
    ingredients_used: bowlIng,
    instructions: [
      'Season your protein (chicken breast or tofu) with salt, pepper, and herbs.',
      'Sear in a hot skillet for 5-6 minutes per side until cooked through, then slice.',
      'Chop the tomatoes and avocado.',
      'Assemble the sliced protein alongside the fresh veggies in a bowl.',
      'Drizzle with olive oil or a squeeze of lemon juice.',
    ],
    prep_time: '20 mins',
  });

  // Recipe 3: Simple Pantry Melt
  const meltName = 'Cheesy Tomato Melt';
  const meltIng = ['Cheddar Cheese'];
  if (detectedNames.includes('Tomatoes')) meltIng.push('Tomatoes');
  recipes.push({
    name: meltName,
    ingredients_used: meltIng,
    instructions: [
      'Slice the tomatoes and get your favorite bread slices.',
      'Layer cheese and tomato slices on the bread.',
      'Toast in a skillet with butter over medium-low heat until the bread is golden and the cheese is fully melted.',
      'Cut in half and serve warm.',
    ],
    prep_time: '12 mins',
  });

  if (oldestItems.length > 0) {
    const oldestLower = oldestItems.map((o) => o.toLowerCase());
    recipes.sort((a, b) => {
      const aCount = a.ingredients_used.filter((ing) => oldestLower.includes(ing.toLowerCase())).length;
      const bCount = b.ingredients_used.filter((ing) => oldestLower.includes(ing.toLowerCase())).length;
      return bCount - aCount;
    });
  }

  return {
    ingredients,
    recipes: recipes.slice(0, 3),
  };
}

export async function analyzeFridgeImage(
  imageBuffer: Buffer,
  imageMimeType: string,
  dietaryRestrictions: string[],
  inventoryItems: { name: string; added_at?: string }[] = [],
  strictMatch: boolean = false,
  saveTheFood: boolean = false
): Promise<AnalyzeResponse> {
  const client = getGeminiClient();
  const invNames = inventoryItems.map((item) => item.name);

  let oldestItems: string[] = [];
  if (saveTheFood && inventoryItems.length > 0) {
    const sorted = [...inventoryItems].sort((a, b) => {
      return (a.added_at || '').localeCompare(b.added_at || '');
    });
    oldestItems = sorted.slice(0, 3).map((item) => item.name);
  }

  if (!client) {
    console.warn('GEMINI_API_KEY environment variable is not set. Running in Demo Mode.');
    return generateMockData(dietaryRestrictions, invNames, strictMatch, oldestItems);
  }

  try {
    const inventoryContext = invNames.length > 0
      ? `\nUser's Current Inventory: ${invNames.join(', ')}${
          oldestItems.length > 0 ? `\nOldest Ingredients (Prioritize using these): ${oldestItems.join(', ')}` : ''
        }`
      : '';

    const dietaryContext = dietaryRestrictions.length > 0
      ? `\nDietary Restrictions (MUST strictly follow): ${dietaryRestrictions.join(', ')}`
      : '';

    const prompt = `
Analyze this image of a refrigerator or pantry. Perform two tasks:
1. Extract all visible ingredients (items, quantity estimate, category, and an estimated shelf life / days to expiration based on general food storage guidelines).
2. Generate exactly 3 recipes using the ingredients.

Parameters to follow strictly:
- "Strict Match Toggle" is set to: ${strictMatch}. 
  If True, you MUST only generate recipes using ingredients present in the User's Current Inventory list. Do not use items visible in the image if they are not in the list.
  If False, you can use ingredients visible in the image, but still try to use the inventory items.
- "Save the Food Toggle" is set to: ${saveTheFood}.
  If True, prioritize the "Oldest Ingredients" mentioned below at the top of recipe ingredients and recipe ordering.
${dietaryContext}
${inventoryContext}

Return the results ONLY as a valid JSON object matching this schema:
{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 1.0,
      "unit": "pcs/ml/grams/etc",
      "category": "Dairy/Vegetables/Meat/etc",
      "days_to_expiration": 5
    }
  ],
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients_used": ["ingredient1", "ingredient2"],
      "instructions": ["Step 1...", "Step 2..."],
      "prep_time": "15 mins"
    }
  ]
}
Do not write markdown block quotes (like \`\`\`json), just return raw JSON text.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: imageMimeType,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultText = response.text?.trim() || '{}';
    
    // Clean potential markdown blocks
    if (resultText.startsWith('```')) {
      const lines = resultText.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines[lines.length - 1].startsWith('```')) lines.pop();
      resultText = lines.join('\n').trim();
    }

    return JSON.parse(resultText) as AnalyzeResponse;
  } catch (error) {
    handleGeminiError(error);
  }
}

export async function generateRecipesFromIngredients(
  dietaryRestrictions: string[],
  inventoryItems: { name: string; added_at?: string }[] = [],
  strictMatch: boolean = false,
  saveTheFood: boolean = false
): Promise<ScanRecipe[]> {
  const client = getGeminiClient();
  const invNames = inventoryItems.map((item) => item.name);

  let oldestItems: string[] = [];
  if (saveTheFood && inventoryItems.length > 0) {
    const sorted = [...inventoryItems].sort((a, b) => {
      return (a.added_at || '').localeCompare(b.added_at || '');
    });
    oldestItems = sorted.slice(0, 3).map((item) => item.name);
  }

  if (!client) {
    console.warn('GEMINI_API_KEY environment variable is not set. Running in Demo Mode.');
    const mock = generateMockData(dietaryRestrictions, invNames, strictMatch, oldestItems);
    return mock.recipes;
  }

  try {
    const inventoryContext = invNames.length > 0
      ? `\nUser's Current Inventory: ${invNames.join(', ')}${
          oldestItems.length > 0 ? `\nOldest Ingredients (Prioritize using these): ${oldestItems.join(', ')}` : ''
        }`
      : '';

    const dietaryContext = dietaryRestrictions.length > 0
      ? `\nDietary Restrictions (MUST strictly follow): ${dietaryRestrictions.join(', ')}`
      : '';

    const prompt = `
Generate exactly 3 recipes using the ingredients available.

Parameters to follow strictly:
- "Strict Match Toggle" is set to: ${strictMatch}. 
  If True, you MUST only generate recipes using ingredients present in the User's Current Inventory list. Do not suggest recipes that require external ingredients not present in the inventory.
  If False, you can suggest recipes that use primarily the inventory items but can include common pantry staples.
- "Save the Food Toggle" is set to: ${saveTheFood}.
  If True, prioritize the "Oldest Ingredients" mentioned below at the top of recipe ingredients and recipe ordering.
${dietaryContext}
${inventoryContext}

Return the results ONLY as a valid JSON array matching this schema:
[
  {
    "name": "Recipe Name",
    "ingredients_used": ["ingredient1", "ingredient2"],
    "instructions": ["Step 1...", "Step 2..."],
    "prep_time": "15 mins"
  }
]
Do not write markdown block quotes (like \`\`\`json), just return raw JSON text.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultText = response.text?.trim() || '[]';
    
    // Clean potential markdown blocks
    if (resultText.startsWith('```')) {
      const lines = resultText.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines[lines.length - 1].startsWith('```')) lines.pop();
      resultText = lines.join('\n').trim();
    }

    return JSON.parse(resultText) as ScanRecipe[];
  } catch (error) {
    handleGeminiError(error);
  }
}

