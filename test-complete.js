// Complete feature test for Agent Forces
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_ADDRESS = 'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7';

async function testFeature(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ ${name} - PASSED\n`);
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}\n`);
  }
}

async function runTests() {
  console.log('🚀 Agent Forces Complete Feature Test\n');

  // Test 1: Health Check
  await testFeature('Health Check', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'healthy') throw new Error('Health check failed');
  });

  // Test 2: AI Chat (FAQ)
  await testFeature('AI Chat - FAQ Response', async () => {
    const res = await axios.post(`${BASE_URL}/api/query`, {
      question: 'What is the minimum ADA required to stake?'
    });
    if (!res.data.answer.includes('Agent Forces')) throw new Error('No AI response');
    if (res.data.source !== 'faq') throw new Error('FAQ not triggered');
  });

  // Test 3: AI Chat (LLM)
  await testFeature('AI Chat - LLM Response', async () => {
    const res = await axios.post(`${BASE_URL}/api/query`, {
      question: 'Tell me about Cardano governance'
    });
    if (!res.data.answer.includes('Agent Forces')) throw new Error('No AI response');
    if (res.data.source === 'faq') throw new Error('Should use LLM, not FAQ');
  });

  // Test 4: Wallet Connection & Analysis
  await testFeature('Wallet Connection & Analysis', async () => {
    const res = await axios.post(`${BASE_URL}/api/query`, {
      question: 'What is my balance?',
      walletAddress: TEST_ADDRESS
    });
    if (!res.data.walletData) throw new Error('No wallet data');
    if (typeof res.data.walletData.balance !== 'number') throw new Error('No balance');
  });

  // Test 5: Premium Mode
  await testFeature('Premium Mode', async () => {
    const res = await axios.post(`${BASE_URL}/api/query`, {
      question: 'Analyze my wallet',
      walletAddress: TEST_ADDRESS,
      premium: true
    });
    if (!res.data.masumiPaymentInfo) throw new Error('No premium payment info');
  });

  // Test 6: Pool Recommendations
  await testFeature('Pool Recommendations', async () => {
    const res = await axios.get(`${BASE_URL}/api/pools`);
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No pools');
    if (!res.data[0].warning && !res.data[0].status) throw new Error('No pool warnings/status');
  });

  // Test 7: Transaction Troubleshooting
  await testFeature('Transaction Troubleshooting', async () => {
    const res = await axios.post(`${BASE_URL}/api/troubleshoot-tx`, {
      txHash: 'invalid_hash_for_testing'
    });
    if (!res.data.answer.includes('Agent Forces')) throw new Error('No troubleshoot response');
  });

  // Test 8: Analytics
  await testFeature('Admin Analytics', async () => {
    const res = await axios.get(`${BASE_URL}/api/admin/analytics`);
    if (typeof res.data.totalQueries !== 'number') throw new Error('No analytics data');
  });

  // Test 9: Masumi Audit Trail
  await testFeature('Masumi Audit Trail', async () => {
    const res = await axios.get(`${BASE_URL}/api/audit`);
    if (!res.data.entries || !res.data.stats) throw new Error('No audit data');
  });

  console.log('🎉 All tests completed! Check results above.');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };