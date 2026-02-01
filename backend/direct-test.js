require('dotenv').config();
const axios = require('axios');

async function testDirectAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔍 Testing Gemini API directly with HTTP...');
  console.log('API Key:', apiKey);
  
  try {
    // Test with direct HTTP call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: 'Hello, test message' }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ SUCCESS! API Key is valid');
    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('❌ FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 400) {
      console.log('🚨 API Key might be invalid or not enabled for Gemini API');
    } else if (error.response?.status === 403) {
      console.log('🚨 API Key lacks permissions or quota exceeded');
    } else if (error.response?.status === 404) {
      console.log('🚨 Model not found or API endpoint incorrect');
    }
  }
}

testDirectAPI();