const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Agent Forces API...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data);
  } catch (e) {
    console.log('❌ Health failed:', e.message);
  }

  // Test 2: Basic Cardano Question
  try {
    console.log('\n2️⃣ Testing Basic Cardano Question...');
    const basic = await axios.post(`${BASE_URL}/api/query`, {
      question: "What is staking?",
      premium: false
    });
    console.log('✅ Basic Response:', basic.data.answer.slice(0, 100) + '...');
    console.log('📊 Metadata:', basic.data.metadata);
  } catch (e) {
    console.log('❌ Basic query failed:', e.response?.data || e.message);
  }

  // Test 3: Wallet + Premium Mode
  try {
    console.log('\n3️⃣ Testing Wallet Scan + Premium Mode...');
    const premium = await axios.post(`${BASE_URL}/api/query`, {
      question: "How should I manage my wallet?",
      walletAddress: "addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7",
      premium: true
    });
    console.log('✅ Premium Response:', premium.data.answer.slice(0, 100) + '...');
    console.log('💎 Premium Mode:', premium.data.metadata.premium);
    console.log('💳 Wallet Data:', premium.data.walletData);
    console.log('🔐 Audit Hash:', premium.data.audit.hash.slice(0, 16) + '...');
  } catch (e) {
    console.log('❌ Premium query failed:', e.response?.data || e.message);
  }

  // Test 4: Non-Cardano Question (should be filtered)
  try {
    console.log('\n4️⃣ Testing Non-Cardano Question Filter...');
    const nonCardano = await axios.post(`${BASE_URL}/api/query`, {
      question: "What is Bitcoin?",
      premium: false
    });
    console.log('✅ Filter Response:', nonCardano.data.answer.slice(0, 100) + '...');
  } catch (e) {
    console.log('❌ Filter test failed:', e.response?.data || e.message);
  }

  // Test 5: Real-time Features
  try {
    console.log('\n5️⃣ Testing Real-time Features...');
    const realTime = await axios.post(`${BASE_URL}/api/query`, {
      question: "Check my wallet balance",
      walletAddress: "addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7",
      premium: false
    });
    console.log('✅ Real-time scan completed');
    console.log('⏱️ Response time:', realTime.data.metadata.responseTime + 'ms');
    console.log('🔄 Real-time data:', realTime.data.metadata.realTimeData);
  } catch (e) {
    console.log('❌ Real-time test failed:', e.response?.data || e.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

testAPI().catch(console.error);