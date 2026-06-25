require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('Testing Google Gemini API...');
  console.log('API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
  
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY not found in .env file');
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = 'Return a simple JSON object: {"test": "success", "message": "API is working"}';
    
    console.log('Sending test request to Gemini API...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    console.log('Response received!');
    console.log('Response text:', response.text);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response.text.trim());
      console.log('Parsed JSON:', parsed);
      console.log('✅ Google Gemini API is working correctly!');
    } catch (parseError) {
      console.log('Response is not JSON (but API call succeeded):', response.text);
      console.log('✅ Google Gemini API is working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error.message);
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
      console.error('The API key appears to be invalid or has expired.');
    }
  }
}

testGeminiAPI();