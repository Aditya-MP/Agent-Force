require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API connection...');
    console.log('API Key present:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Test connection');
    console.log('✅ SUCCESS:', result.response.text());
    
  } catch (error) {
    console.error('❌ FAILED:');
    console.error('- Type:', error.constructor.name);
    console.error('- Message:', error.message);
    console.error('- Code:', error.code || 'N/A');
    
    if (error.message?.includes('429')) {
      console.log('🚨 DIAGNOSIS: Rate limit exceeded');
    } else if (error.message?.includes('400')) {
      console.log('🚨 DIAGNOSIS: Bad request format');
    } else if (error.message?.includes('401')) {
      console.log('🚨 DIAGNOSIS: Invalid API key');
    } else if (error.message?.includes('500')) {
      console.log('🚨 DIAGNOSIS: Google server error');
    }
  }
}

testGemini();