const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const parseRecipeFromText = async (recipeText) => {
  try {
    const prompt = `You are a recipe parser. Extract the recipe information from this text/HTML and return it in the following JSON format:

{
  "name": "Recipe name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": "prep time in minutes (number only)",
  "cookTime": "cook time in minutes (number only)",
  "servings": "number of servings (number only)",
  "imageUrl": "main recipe image URL if available"
}

Important:
- Extract ingredient names clearly (e.g., "chicken breast", "olive oil", "salt")
- Keep ingredients simple and searchable
- If any field is not available, use null

Here's the recipe text/HTML:
${recipeText.substring(0, 50000)}`;

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!geminiResponse.ok) {
      if (geminiResponse.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      }
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No recipe data extracted');
    }

    // Clean and parse the JSON
    const jsonText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recipe = JSON.parse(jsonText);

    return recipe;
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw error;
  }
};
