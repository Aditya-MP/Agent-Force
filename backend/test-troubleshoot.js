const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testTroubleshoot() {
  console.log('🧪 Testing Troubleshoot Endpoint...\n');

  // Test 1: Invalid/Fake Hash
  console.log('1️⃣ Testing fake transaction hash...');
  try {
    const fake = await axios.post(`${BASE_URL}/api/troubleshoot-tx`, {
      txHash: 'fakehash123invalid'
    });
    console.log('✅ Fake hash response:', fake.data.answer.slice(0, 100) + '...');
  } catch (e) {
    console.log('❌ Fake hash test failed:', e.response?.data || e.message);
  }

  // Test 2: Malformed Hash
  console.log('\n2️⃣ Testing malformed transaction hash...');
  try {
    const malformed = await axios.post(`${BASE_URL}/api/troubleshoot-tx`, {
      txHash: 'abc123'
    });
    console.log('✅ Malformed hash response:', malformed.data.answer.slice(0, 100) + '...');
  } catch (e) {
    console.log('❌ Malformed hash test failed:', e.response?.data || e.message);
  }

  // Test 3: Valid Format but Non-existent Hash
  console.log('\n3️⃣ Testing valid format but non-existent hash...');
  try {
    const nonExistent = await axios.post(`${BASE_URL}/api/troubleshoot-tx`, {
      txHash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890'
    });
    console.log('✅ Non-existent hash response:', nonExistent.data.answer.slice(0, 100) + '...');
  } catch (e) {
    console.log('❌ Non-existent hash test failed:', e.response?.data || e.message);
  }

  // Test 4: Missing txHash parameter
  console.log('\n4️⃣ Testing missing txHash parameter...');
  try {
    const missing = await axios.post(`${BASE_URL}/api/troubleshoot-tx`, {});
    console.log('✅ Missing param response:', missing.data);
  } catch (e) {
    console.log('✅ Missing param correctly rejected:', e.response?.data || e.message);
  }

  // Test 5: Real transaction hash (if available)
  console.log('\n5️⃣ Testing with a real-looking transaction hash...');
  try {
    // This is a properly formatted hash that might exist on preview network
    const realFormat = await axios.post(`${BASE_URL}/api/troubleshoot-tx`, {
      txHash: '3b9c4c1c8b8e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0'
    });
    console.log('✅ Real format response:', realFormat.data.answer.slice(0, 100) + '...');
    if (realFormat.data.troubleshootMode) {
      console.log('✅ Troubleshoot mode flag present');
    }
  } catch (e) {
    console.log('❌ Real format test failed:', e.response?.data || e.message);
  }

  console.log('\n🎉 Troubleshoot Testing Complete!');
}

testTroubleshoot().catch(console.error);