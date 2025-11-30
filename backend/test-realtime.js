require('dotenv').config();
const axios = require('axios');

// Test real-time wallet scanning
async function testRealTimeWallet() {
  const testAddress = 'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7';
  
  console.log('🚀 Testing REAL-TIME wallet scanning...\n');
  
  try {
    // Test 1: Quick balance check
    console.log('📊 Test 1: Quick Balance Check');
    const balanceRes = await axios.get(`http://localhost:3001/api/balance/${testAddress}`);
    console.log('✅ Balance Response:', balanceRes.data);
    
    // Test 2: Full wallet scan
    console.log('\n📊 Test 2: Full Wallet Scan');
    const walletRes = await axios.get(`http://localhost:3001/api/wallet/${testAddress}`);
    console.log('✅ Wallet Response:', walletRes.data);
    
    // Test 3: Invalid address
    console.log('\n📊 Test 3: Invalid Address Test');
    try {
      await axios.get('http://localhost:3001/api/balance/invalid_address');
    } catch (e) {
      console.log('✅ Error handling works:', e.response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure backend is running: node index.js');
  }
}

testRealTimeWallet();