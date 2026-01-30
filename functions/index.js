const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

/**
 * Analyze receipt using Gemini AI when a new receipt document is created
 */
exports.analyzeReceipt = onDocumentCreated(
  {
    document: 'receipts/{receiptId}',
    region: 'us-central1',
    secrets: ['GEMINI_API_KEY'],
  },
  async (event) => {
    const receiptId = event.params.receiptId;
    const receiptData = event.data.data();

    console.log(`Analyzing receipt: ${receiptId}`);

    try {
      // Update status to processing
      await db.collection('receipts').doc(receiptId).update({
        'metadata.analysisStatus': 'processing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Get Gemini API key from secret
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Download image from Storage
      const imagePath = receiptData.imagePath;
      const bucket = storage.bucket();
      const file = bucket.file(imagePath);
      const [imageBuffer] = await file.download();
      const base64Image = imageBuffer.toString('base64');

      // Create the prompt
      const prompt = createReceiptAnalysisPrompt();

      // Call Gemini API
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      console.log('Gemini response:', text);

      // Parse JSON response
      const parsedData = parseGeminiResponse(text);

      // Update receipt with parsed data
      await db.collection('receipts').doc(receiptId).update({
        storeInfo: parsedData.storeInfo,
        items: parsedData.items,
        summary: parsedData.summary,
        'metadata.analysisStatus': 'completed',
        'metadata.processedAt': admin.firestore.FieldValue.serverTimestamp(),
        'metadata.geminiFeedback': parsedData.confidence || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Receipt ${receiptId} analyzed successfully`);
    } catch (error) {
      console.error(`Error analyzing receipt ${receiptId}:`, error);

      // Update receipt with error status
      await db.collection('receipts').doc(receiptId).update({
        'metadata.analysisStatus': 'failed',
        'metadata.processingError': error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

/**
 * Create the prompt for Gemini to analyze the receipt
 */
function createReceiptAnalysisPrompt() {
  return `Analyze this grocery receipt image and extract the following information in JSON format:

{
  "storeInfo": {
    "name": "Store name if visible (string or null)",
    "location": "City, State if visible (string or null)",
    "date": "Date in YYYY-MM-DD format (string or null)"
  },
  "items": [
    {
      "name": "Item name (string)",
      "category": "One of: grocery|produce|meat|dairy|bakery|frozen|beverages|snacks|household|personal care|health|other",
      "quantity": "Quantity as number (default 1)",
      "unitPrice": "Unit price as number",
      "totalPrice": "Total price for this item as number"
    }
  ],
  "summary": {
    "subtotal": "Subtotal as number",
    "tax": "Tax amount as number",
    "total": "Total amount as number"
  },
  "confidence": "high|medium|low - your confidence in the extraction"
}

Important instructions:
- Extract ALL items from the receipt
- Be precise with numbers - no dollar signs, just numbers (e.g., 12.99 not $12.99)
- If you can't read a value, set it to null or 0 for numbers
- Categorize each item appropriately
- The total in summary should match the receipt total
- Respond ONLY with valid JSON, no additional text
- If quantity is not visible, assume 1
- Calculate unitPrice = totalPrice / quantity`;
}

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(text) {
  try {
    // Try to extract JSON from the response
    // Sometimes Gemini wraps JSON in markdown code blocks
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);

    // Validate and provide defaults
    return {
      storeInfo: {
        name: parsed.storeInfo?.name || '',
        location: parsed.storeInfo?.location || null,
        date: parsed.storeInfo?.date
          ? admin.firestore.Timestamp.fromDate(new Date(parsed.storeInfo.date))
          : null,
      },
      items: (parsed.items || []).map((item) => ({
        name: item.name || 'Unknown Item',
        category: item.category || 'other',
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        totalPrice: parseFloat(item.totalPrice) || 0,
      })),
      summary: {
        subtotal: parseFloat(parsed.summary?.subtotal) || 0,
        tax: parseFloat(parsed.summary?.tax) || 0,
        total: parseFloat(parsed.summary?.total) || 0,
      },
      confidence: parsed.confidence || 'medium',
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}
