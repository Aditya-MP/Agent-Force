require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    console.log('🔍 Testing API Key and listing available models...');
    console.log('API Key:', process.env.GEMINI_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test different model names
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`\n🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        console.log(`✅ SUCCESS with ${modelName}:`, result.response.text().substring(0, 50) + '...');
        break; // Stop on first success
      } catch (error) {
        console.log(`❌ FAILED ${modelName}:`, error.message.substring(0, 100));
      }
    }
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR:', error.message);
  }
}

listModels();