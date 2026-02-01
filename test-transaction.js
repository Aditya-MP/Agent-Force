// Test transaction analysis directly
const axios = require('axios');

async function testTransactionAnalysis() {
  const testHash = "f3db1c5c95caBd13dDe16144b2a1919c2c55c841314e44ef815e39204a9a0df";
  
  console.log('🔍 Testing transaction analysis...');
  console.log('Hash:', testHash);
  
  try {
    // Test direct troubleshoot endpoint
    const response = await axios.post('http://localhost:3001/api/troubleshoot-tx', {
      txHash: testHash
    });
    
    console.log('✅ Response received:');
    console.log(response.data.answer);
    
    if (response.data.txData) {
      console.log('📊 Transaction Data:');
      console.log('- Status:', response.data.txData.status);
      console.log('- Exact Failure Reason:', response.data.txData.exactFailureReason);
      console.log('- Block:', response.data.txData.block);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

// Test chat endpoint with hash
async function testChatWithHash() {
  const question = "why this transaction failed - f3db1c5c95caBd13dDe16144b2a1919c2c55c841314e44ef815e3 9204a9a0dff";
  
  console.log('\n🔍 Testing chat endpoint with hash...');
  console.log('Question:', question);
  
  try {
    const response = await axios.post('http://localhost:3001/api/query', {
      question: question
    });
    
    console.log('✅ Chat Response:');
    console.log(response.data.answer);
    
    if (response.data.autoTxDetected) {
      console.log('🎯 Auto-detection worked!');
      console.log('Detected hash:', response.data.detectedTxHash);
    } else {
      console.log('❌ Auto-detection failed');
    }
    
  } catch (error) {
    console.error('❌ Chat test failed:', error.message);
  }
}

// Run tests
testTransactionAnalysis().then(() => {
  testChatWithHash();
});