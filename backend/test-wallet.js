require('dotenv').config();
const axios = require('axios');

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;

async function testWalletBalance(address) {
  console.log('🔍 Testing wallet:', address);
  
  try {
    // Test Blockfrost connection
    const response = await axios.get(`https://cardano-preview.blockfrost.io/api/v0/addresses/${address}/utxos`, {
      headers: { project_id: BLOCKFROST_KEY }
    });
    
    const utxos = response.data;
    console.log('✅ UTXOs found:', utxos.length);
    
    // Calculate ADA balance
    const adaBalance = utxos.reduce((sum, utxo) => {
      const ada = utxo.amount.find(a => a.unit === 'lovelace');
      return sum + (ada ? parseInt(ada.quantity) / 1_000_000 : 0);
    }, 0);
    
    console.log('💰 ADA Balance:', adaBalance);
    console.log('📊 Raw UTXO data:', JSON.stringify(utxos.slice(0, 2), null, 2));
    
    return { success: true, balance: adaBalance, utxoCount: utxos.length };
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    return { success: false, error: error.message };
  }
}

// Test with a sample Cardano testnet address
const testAddress = 'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7';

testWalletBalance(testAddress).then(result => {
  console.log('\n📋 Final Result:', result);
});