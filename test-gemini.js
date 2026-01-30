const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace with your actual API key
const API_KEY = 'AIzaSyAyDHcY-kZ7NWmP4_Hw7TuVoHRmVoLq0w0';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Try to list available models
    console.log('Fetching available models...\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    const data = await response.json();

    if (data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
