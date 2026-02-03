const s="AIzaSyAeF_U52WqdiQRsaYMfijH8YtYOLIuJCsM",c="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",d=async(o,t={})=>{const{includePartialMatches:r=!0}=t;try{const n=`You are a creative chef helping someone cook with their groceries.

Available ingredients: ${o.join(", ")}

${r?"The user may not have all ingredients like spices, oils, butter, salt, pepper, and common pantry staples. Suggest recipes even if they're missing these common items.":"Only suggest recipes that strictly use the available ingredients."}

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

Return ONLY the JSON array, no additional text.`,e=await fetch(`${c}?key=${s}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}],generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:2048}})});if(!e.ok)throw e.status===429?new Error("Rate limit reached. Please wait a minute and try again."):new Error(`Gemini API error: ${e.statusText}`);const i=(await e.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!i)throw new Error("No response from Gemini API");const p=i.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(p)}catch(n){throw console.error("generateRecipesFromIngredients error:",n),n}},l=async o=>{try{const r=await fetch(`${c}?key=${s}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`You are analyzing a photo of someone's pantry or grocery items.

Please identify all visible food items and ingredients in this image. List them as simple ingredient names (e.g., "tomatoes", "chicken breast", "olive oil", "pasta").

Return ONLY a JSON array of ingredient names, like this:
["ingredient1", "ingredient2", "ingredient3"]

Focus on ingredients that can be used for cooking. Ignore packaging, brands, or non-food items.`},{inline_data:{mime_type:"image/jpeg",data:o}}]}],generationConfig:{temperature:.4,topK:32,topP:.95,maxOutputTokens:1024}})});if(!r.ok)throw r.status===429?new Error("Rate limit reached. Please wait a minute and try again."):new Error(`Gemini API error: ${r.statusText}`);const e=(await r.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!e)throw new Error("No response from Gemini API");const a=e.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(a)}catch(t){throw console.error("analyzePantryPhoto error:",t),t}},h=async o=>{try{const t=`Categorize this grocery/shopping item into ONE of these categories:

produce - Fresh fruits, vegetables, herbs
meat - Meat, poultry, seafood, fish
dairy - Milk, cheese, yogurt, eggs, butter
bakery - Bread, bagels, pastries, baked goods
frozen - Frozen foods, ice cream
pantry - Canned goods, pasta, rice, flour, spices, condiments, oils
beverages - Drinks, juice, soda, coffee, tea
snacks - Chips, crackers, candy, cookies
household - Cleaning supplies, paper products, toiletries, pet food
other - Anything that doesn't fit above categories

Item: "${o}"

Return ONLY the category value (one word: produce, meat, dairy, bakery, frozen, pantry, beverages, snacks, household, or other). No explanation, just the category word.`,r=await fetch(`${c}?key=${s}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}],generationConfig:{temperature:.1,topK:1,topP:.95,maxOutputTokens:10}})});if(!r.ok)return console.warn('Gemini API error, falling back to "other" category'),"other";const e=(await r.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!e)return"other";const a=e.trim().toLowerCase();return["produce","meat","dairy","bakery","frozen","pantry","beverages","snacks","household","other"].includes(a)?a:"other"}catch(t){return console.warn('categorizeShoppingItem error, falling back to "other":',t),"other"}};export{l as a,h as c,d as g};
