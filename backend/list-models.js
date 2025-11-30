require('dotenv').config();
const axios = require('axios');

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔍 Listing available models...');
  
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log('  ✅ Supports generateContent');
      }
    });
    
    // Try the first available model
    const firstModel = response.data.models.find(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    
    if (firstModel) {
      console.log(`\n🧪 Testing with: ${firstModel.name}`);
      await testModel(firstModel.name, apiKey);
    }
    
  } catch (error) {
    console.error('❌ Failed to list models:', error.response?.data || error.message);
  }
}

async function testModel(modelName, apiKey) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: 'Hello, this is a test' }]
        }]
      }
    );
    
    console.log('✅ SUCCESS with', modelName);
    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('❌ Failed with', modelName, ':', error.response?.data?.error?.message || error.message);
  }
}

listAvailableModels();