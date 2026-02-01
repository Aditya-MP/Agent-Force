require('dotenv').config();
const axios = require('axios');

async function debugWallet() {
  const address = 'addr_test1qznv43te465jae0qucushqpnjtqv8q52cwyuzcj52sywcp4cm06u45x8zxe346tc2en09eh8y6ged35y3ngz34r8warqxst5qe';
  const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;
  
  console.log('🔍 Debugging wallet:', address);
  console.log('🔑 Blockfrost Key:', BLOCKFROST_KEY);
  
  // Test different networks
  const networks = [
    { name: 'Preview', url: 'https://cardano-preview.blockfrost.io/api/v0' },
    { name: 'Preprod', url: 'https://cardano-preprod.blockfrost.io/api/v0' },
    { name: 'Mainnet', url: 'https://cardano-mainnet.blockfrost.io/api/v0' }
  ];
  
  for (const network of networks) {
    try {
      console.log(`\n🌐 Testing ${network.name} network...`);
      
      const utxosRes = await axios.get(`${network.url}/addresses/${address}/utxos`, {
        headers: { project_id: BLOCKFROST_KEY }
      });
      
      console.log(`✅ ${network.name} - UTXOs found:`, utxosRes.data.length);
      
      if (utxosRes.data.length > 0) {
        const adaBalance = utxosRes.data.reduce((sum, u) => {
          const ada = u.amount.find(a => a.unit === 'lovelace');
          return sum + (ada ? parseInt(ada.quantity) / 1_000_000 : 0);
        }, 0);
        
        console.log(`💰 ${network.name} - ADA Balance:`, adaBalance);
        console.log(`📊 ${network.name} - Raw UTXOs:`, JSON.stringify(utxosRes.data, null, 2));
        
        if (adaBalance > 0) {
          console.log(`🎉 FOUND BALANCE ON ${network.name.toUpperCase()}!`);
          break;
        }
      }
      
    } catch (error) {
      console.log(`❌ ${network.name} - Error:`, error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

debugWallet();