/**
 * Gemini AI Service for recipe generation
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

/**
 * Generate recipes from ingredients using Gemini AI
 * @param {Array<string>} ingredients - List of ingredients
 * @param {Object} options - Options { includePartialMatches: boolean }
 * @returns {Promise<Array>} Array of recipe suggestions
 */
export const generateRecipesFromIngredients = async (ingredients, options = {}) => {
  const { includePartialMatches = true } = options;

  try {
    const prompt = `You are a creative chef helping someone cook with their groceries.

Available ingredients: ${ingredients.join(', ')}

${includePartialMatches ? 'The user may not have all ingredients like spices, oils, butter, salt, pepper, and common pantry staples. Suggest recipes even if they\'re missing these common items.' : 'Only suggest recipes that strictly use the available ingredients.'}

Please suggest 5 delicious, practical recipes that can be made primarily with these ingredients. For each recipe, provide:
1. Recipe name
2. Brief description (1 sentence)
3. Missing ingredients (if any) - especially highlight any essential ingredients not in the list
4. Link to a real recipe from AllRecipes.com, FoodNetwork.com, or another major recipe site (search online and provide actual working URLs)
5. Difficulty level (Easy/Medium/Hard)
6. Cooking time (in minutes)

Format your response as a JSON array with this structure:
[
  {
    "name": "Recipe Name",
    "description": "Brief description",
    "matchedIngredients": ["ingredient1", "ingredient2"],
    "missingIngredients": ["ingredient3", "ingredient4"],
    "recipeUrl": "https://www.allrecipes.com/recipe/...",
    "difficulty": "Easy",
    "cookingTime": 30
  }
]

Return ONLY the JSON array, no additional text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON from the response
    // Remove markdown code blocks if present
    const jsonText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recipes = JSON.parse(jsonText);

    return recipes;
  } catch (error) {
    console.error('generateRecipesFromIngredients error:', error);
    throw error;
  }
};

/**
 * Analyze a photo of pantry items to extract ingredients using Gemini Vision
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Array<string>>} Array of ingredient names
 */
export const analyzePantryPhoto = async (imageBase64) => {
  try {
    const prompt = `You are analyzing a photo of someone's pantry or grocery items.

Please identify all visible food items and ingredients in this image. List them as simple ingredient names (e.g., "tomatoes", "chicken breast", "olive oil", "pasta").

Return ONLY a JSON array of ingredient names, like this:
["ingredient1", "ingredient2", "ingredient3"]

Focus on ingredients that can be used for cooking. Ignore packaging, brands, or non-food items.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON from the response
    const jsonText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const ingredients = JSON.parse(jsonText);

    return ingredients;
  } catch (error) {
    console.error('analyzePantryPhoto error:', error);
    throw error;
  }
};
