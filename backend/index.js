require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { storeMasumiEntry } = require('./masumi-storage');

console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini AI initialized');
  } catch (e) {
    console.log('⚠️ Gemini initialization failed:', e.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;
const PORT = 3001;

const analytics = {
  totalQueries: 0,
  balance: 0,
  staking: 0,
  txHelp: 0,
  other: 0,
};

function classifyCategory(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('balance') || m.includes('how much ada') || m.includes('utxo')) return 'balance';
  if (m.includes('stake') || m.includes('staking') || m.includes('pool')) return 'staking';
  if (m.includes('tx ') || m.includes('transaction') || m.includes('hash')) return 'txHelp';
  return 'other';
}

console.log('🔧 Configuration:');
console.log('- Port:', PORT);
console.log('- Blockfrost Key:', BLOCKFROST_KEY ? 'Present' : 'Missing');

async function getWalletSummary(address) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] LIVE SCAN: ${address.slice(0, 20)}...`);

  if (!address || address.length < 50) {
    return { error: 'Invalid Cardano address format', timestamp };
  }

  if (!BLOCKFROST_KEY) {
    return { error: 'Blockfrost API key not configured', timestamp };
  }

  try {
    const cacheBuster = Date.now();
    const utxosRes = await axios.get(
      `https://cardano-preview.blockfrost.io/api/v0/addresses/${address}/utxos?_t=${cacheBuster}`,
      {
        headers: {
          'project_id': BLOCKFROST_KEY,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 15000
      }
    );

    const utxos = utxosRes.data;
    let adaBalance = 0;
    let hasTokens = false;
    let totalValue = 0;

    console.log(`📊 Found ${utxos.length} UTXOs for address`);

    utxos.forEach((utxo, index) => {
      console.log(`  UTXO ${index + 1}: ${utxo.tx_hash}#${utxo.output_index}`);
      utxo.amount.forEach(asset => {
        if (asset.unit === 'lovelace') {
          const amount = parseInt(asset.quantity);
          adaBalance += amount / 1_000_000;
          totalValue += amount;
          console.log(`    ADA: ${(amount / 1_000_000).toFixed(6)}`);
        } else {
          hasTokens = true;
          console.log(`    Token: ${asset.unit} = ${asset.quantity}`);
        }
      });
    });

    const finalBalance = Math.round(adaBalance * 1_000_000) / 1_000_000;
    console.log(`💰 Total Balance: ${finalBalance} ADA (${totalValue} lovelace)`);

    return {
      balance: finalBalance,
      utxoCount: utxos.length,
      hasTokens,
      scanTime: timestamp,
      network: 'preview',
      totalLovelace: totalValue,
      lastUpdated: Date.now()
    };

  } catch (e) {
    console.error('Wallet scan error:', e.message);
    return {
      error: e.response?.data?.message || e.message,
      errorCode: e.response?.status || 'NETWORK_ERROR',
      scanTime: timestamp,
      network: 'preview'
    };
  }
}

async function getNetworkStats() {
  if (!BLOCKFROST_KEY) {
    return {
      blocks: 156,
      txs24h: 12500,
      activePools: 2800,
      networkStatus: '🟢 Demo (No Key)'
    };
  }

  try {
    // Fetch latest epoch for blocks/txs
    const epochRes = await axios.get(
      'https://cardano-preview.blockfrost.io/api/v0/epochs/latest',
      { headers: { 'project_id': BLOCKFROST_KEY } }
    );

    // Fetch count of active pools (approximate via pools endpoint page 1)
    // Note: Retrieving total active pools requires iterating pages, 
    // for speed we'll use a static estimation or just "3000+" for mainnet, 
    // but for preview testnet it's smaller. We'll use the unique pools count from epoch if available, 
    // or just a placeholder 'Live' indicator.

    return {
      blocks: epochRes.data.block_count,
      txs24h: epochRes.data.tx_count, // Transactions in this epoch
      activePools: 'Live Data',
      networkStatus: '🟢 Synced'
    };
  } catch (e) {
    console.error('Network stats error:', e.message);
    return {
      blocks: 0,
      txs24h: 0,
      activePools: 'Error',
      networkStatus: '🔴 Network Error'
    };
  }
}

async function getRecommendedPools() {
  if (!BLOCKFROST_KEY) {
    return [
      { id: 'pool1demo...', saturation: 45, margin: 3, roa: 4.2, status: 'simulated' }
    ];
  }

  try {
    // 1. Get a list of pools (fetching page 1, order desc)
    // We'll limit to 5 for performance in this demo
    const poolsRes = await axios.get(
      'https://cardano-preview.blockfrost.io/api/v0/pools?page=1&count=5&order=desc',
      { headers: { 'project_id': BLOCKFROST_KEY } }
    );

    const poolIds = poolsRes.data; // Array of pool strings
    const detailedPools = [];

    // 2. Fetch details for each pool parallelly
    const poolPromises = poolIds.map(async (poolId) => {
      try {
        const detailRes = await axios.get(
          `https://cardano-preview.blockfrost.io/api/v0/pools/${poolId}`,
          { headers: { 'project_id': BLOCKFROST_KEY } }
        );
        const p = detailRes.data;

        // Calculate a simple status based on saturation
        let status = 'good';
        const saturation = p.live_saturation * 100;
        if (saturation > 90) status = 'oversaturated';
        if (saturation > 80) status = 'warning';
        if (saturation < 1) status = 'new/low';

        return {
          id: p.pool_id,
          saturation: parseFloat(saturation.toFixed(2)),
          margin: p.tax_ratio * 100,
          roa: 3.5, // Blockfrost doesn't give ROA directly in this endpoint, usually requires calc. We'll estimate typical testnet ROA.
          status,
          fixed_cost: parseInt(p.tax_fix) / 1000000,
          blocks_minted: p.blocks_minted
        };
      } catch (err) {
        return null;
      }
    });

    const results = await Promise.all(poolPromises);
    return results.filter(p => p !== null).map(pool => ({
      ...pool,
      warning: pool.saturation > 90 ? 'Oversaturated - rewards may be reduced' :
        pool.saturation > 75 ? 'High saturation - monitor closely' : null
    }));

  } catch (e) {
    console.error('Pool fetch error:', e.message);
    return [];
  }
}

function riskAgentScoreWallet(balanceAda, utxoCount) {
  let score = 0;
  if (balanceAda > 100_000) score += 2;
  if (utxoCount > 200) score += 1;
  if (utxoCount === 0) score += 1;

  let level = 'Low';
  if (score >= 2) level = 'Medium';
  if (score >= 4) level = 'High';

  return {
    level,
    score,
    explanation: `Demo risk agent: balance=${balanceAda} ADA, utxos=${utxoCount}, score=${score}.`
  };
}

function isCardanoRelated(question) {
  const cardanoKeywords = [
    'ada', 'cardano', 'stake', 'staking', 'pool', 'pools', 'utxo', 'utxos',
    'reward', 'rewards', 'epoch', 'delegation', 'delegate', 'wallet',
    'transaction', 'tx', 'fee', 'fees', 'balance', 'native token', 'token',
    'hi', 'hello', 'hey', 'help', 'explain', 'what', 'how', 'why', 'when'
  ];

  return cardanoKeywords.some(keyword => question.toLowerCase().includes(keyword));
}

async function callLLM(prompt, originalQuestion) {
  if (!isCardanoRelated(originalQuestion)) {
    return `🤖 CardanoVault: I'm specialized in Cardano blockchain assistance! I can help you with:\n\n• 💰 Staking & Rewards (earn 4-5% APY)\n• 🎯 Stake Pool Selection\n• 💳 Wallet Management & UTXOs\n• 📊 Transaction Analysis\n• 🏛️ Governance & Voting\n• 🔗 DeFi & Smart Contracts\n\nPlease ask me something about Cardano, ADA, or blockchain! 🚀`;
  }

  if (!model) {
    console.log('⚠️ Gemini not available - using fallback');
    return getCardanoFallbackResponse(originalQuestion, prompt);
  }

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🚀 Calling Gemini API (attempt ${attempt}/3)...`);
      const cardanoPrompt = `You are CardanoVault, a specialized Cardano blockchain assistant. You ONLY answer questions about Cardano, ADA cryptocurrency, staking, pools, wallets, transactions, DeFi, NFTs, governance, and related blockchain topics.

IMPORTANT RULES:
- If asked about non-Cardano topics, politely redirect to Cardano
- Always be helpful, friendly, and educational
- Use simple explanations with analogies when possible
- Focus on practical, actionable advice
- Include current wallet data when available
- NEVER mention or display wallet addresses in responses for privacy
- Keep responses concise but informative (3-6 sentences)
- Always start with "🤖 CardanoVault:" 

${prompt}`;

      const result = await model.generateContent(cardanoPrompt);
      const text = result.response.text();
      console.log('✅ Gemini API success!');
      return text;
    } catch (error) {
      lastError = error;
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      if (attempt < 3) {
        console.log(`⏳ Waiting 1 second before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.log('❌ All Gemini attempts failed - Using intelligent fallback...');
  return getCardanoFallbackResponse(originalQuestion, prompt);
}

function getCardanoFallbackResponse(question, prompt) {
  const lowerQuestion = question.toLowerCase();
  const balance = prompt.match(/Balance: (\d+(?:\.\d+)?) ADA/)?.[1] || '0';
  const utxoCount = prompt.match(/UTXO count: (\d+)/)?.[1] || '0';

  if (lowerQuestion.includes('pool') || lowerQuestion.includes('stake pool') || lowerQuestion.includes('stack pool')) {
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('what are')) {
      return `🤖 CardanoVault: Great question! Stake pools are the heart of Cardano's network! 🏊♂️\n\n🎯 What they are:\n• Servers that validate transactions and create blocks\n• Run by skilled operators 24/7\n• You delegate your ADA to them (no risk!)\n• They share rewards with delegators\n\n💰 How you benefit:\n• Earn ~4-5% annual rewards\n• Your ADA never leaves your wallet\n• Help secure the Cardano network\n• Rewards come every 5 days (epochs)\n\n🔍 Choose pools with 30-70% saturation and low fees for best rewards!`;
    } else {
      return `🤖 CardanoVault: Here's how to find good stake pools:\n\n🎯 Look for pools with:\n• 30-70% saturation (not oversaturated)\n• Low fees (0-5% margin)\n• Consistent block production\n• Good community reputation\n\n💡 Avoid pools over 90% saturated - rewards get reduced!\n\n🔍 Check pool explorers like PoolTool or ADApools for detailed stats.`;
    }
  }

  if (lowerQuestion.includes('transaction') || lowerQuestion.includes('tx ') || lowerQuestion.includes('stuck') || lowerQuestion.includes('pending') || lowerQuestion.includes('failed') || lowerQuestion.includes('fail')) {
    const hashMatch = question.match(/\b[a-fA-F0-9]{60,66}\b/);

    if (hashMatch) {
      const detectedHash = hashMatch[0].length > 64 ? hashMatch[0].substring(0, 64) : hashMatch[0];
      return `🤖 CardanoVault: I detected transaction hash ${detectedHash.slice(0, 16)}... in your question! 🔍\n\n🔧 **Quick Analysis:**\nI'll analyze this transaction for you. Common failure reasons:\n• ❌ Insufficient balance (most common)\n• ⏰ Transaction expired (validity window)\n• 💰 Very high fees (UTXO fragmentation)\n• 🔍 Smart contract issues\n• 🟡 Still pending in mempool\n\n💡 **For detailed diagnosis:** Use the transaction troubleshoot feature with your hash, or I can analyze it automatically if you ask about why it failed!`;
    } else {
      return `🤖 CardanoVault: Transaction troubles? I can help! 🔧\n\n🔍 Common issues:\n• Stuck transactions: Usually resolve in 2-20 minutes\n• High fees: Often due to many small UTXOs\n• Failed transactions: Check validity window and balance\n• Pending: May be waiting in mempool\n\n💡 Solutions:\n• Wait 20 minutes for confirmation\n• Check transaction hash on explorer\n• Ensure sufficient balance + fees\n• Try consolidating UTXOs to reduce fees\n\n**Provide your transaction hash for detailed analysis!**`;
    }
  }

  if (lowerQuestion.includes('staking') || lowerQuestion.includes('stake')) {
    return `🤖 CardanoVault: Staking your ADA is like putting money in a high-yield savings account! 💰\n\n✨ How it works:\n• Delegate to a stake pool (no risk, keep your keys!)\n• Earn ~4-5% rewards annually\n• Rewards come every 5 days (epochs)\n• Your ADA never leaves your wallet\n\n🎯 Your wallet has ${balance} ADA - ${parseFloat(balance) >= 10 ? 'perfect for staking!' : 'you need 10+ ADA to start staking.'}`;
  }

  return `🤖 CardanoVault: I'm your specialized Cardano assistant! 🚀\n\n🎯 I can help with:\n• 💰 Staking & rewards\n• 🏊 Pool selection\n• 💳 Wallet setup\n• 📊 Transaction help\n• 🏛️ Governance\n\nAsk me anything about Cardano!`;
}

async function postMasumiLog(hash, metadata, answer) {
  const entry = storeMasumiEntry(hash, metadata, answer);
  return {
    txHash: entry.id,
    status: 'verified',
    timestamp: entry.timestamp
  };
}

async function checkTransactionAcrossNetworks(txHash) {
  const networks = [
    { name: 'preview', url: 'https://cardano-preview.blockfrost.io/api/v0' },
    { name: 'preprod', url: 'https://cardano-preprod.blockfrost.io/api/v0' },
    { name: 'mainnet', url: 'https://cardano-mainnet.blockfrost.io/api/v0' }
  ];

  for (const network of networks) {
    try {
      const response = await axios.get(
        `${network.url}/txs/${txHash}`,
        {
          headers: { project_id: BLOCKFROST_KEY },
          timeout: 5000,
          validateStatus: (status) => status === 200
        }
      );
      return { found: true, network: network.name, data: response.data };
    } catch (error) {
      continue;
    }
  }

  return { found: false, network: null, data: null };
}

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/query', async (req, res) => {
  const { question, walletAddress, premium = false } = req.body;

  const category = classifyCategory(question);
  analytics.totalQueries += 1;
  analytics[category] += 1;

  try {
    let walletData = null;
    if (walletAddress) {
      console.log(`🔄 Fetching fresh wallet data for query...`);
      walletData = await getWalletSummary(walletAddress);

      if (walletData && !walletData.error) {
        console.log(`✅ Fresh balance: ${walletData.balance} ADA (${walletData.utxoCount} UTXOs)`);
      } else if (walletData && walletData.error) {
        console.log(`❌ Wallet scan failed: ${walletData.error}`);
      }
    }

    const pools = await getRecommendedPools();
    const network = await getNetworkStats();

    let prompt = `Question: ${question}\n\n`;

    if (walletData && !walletData.error) {
      const risk = riskAgentScoreWallet(walletData.balance, walletData.utxoCount);
      prompt += `Wallet Analysis (LIVE DATA):\n`;
      prompt += `- Balance: ${walletData.balance} ADA\n`;
      prompt += `- UTXO count: ${walletData.utxoCount}\n`;
      prompt += `- Risk level: ${risk.level}\n`;
      prompt += `- Last updated: ${new Date(walletData.lastUpdated).toLocaleTimeString()}\n`;
      prompt += `- Scan time: ${walletData.scanTime}\n\n`;
    }

    if (premium) {
      prompt += `Premium Analysis Requested - Provide detailed recommendations and action steps.\n\n`;
    }

    prompt += `Network Status: ${network.networkStatus}\n`;
    prompt += `Active Pools: ${network.activePools}\n\n`;

    let answer = await callLLM(prompt, question);

    const responseHash = crypto.SHA256(answer + Date.now()).toString();
    const auditEntry = await postMasumiLog(responseHash, {
      question: question,
      walletConnected: !!walletAddress,
      premium,
      timestamp: new Date().toISOString()
    }, answer);

    res.json({
      answer,
      walletData,
      pools,
      network,
      proof: { hash: responseHash },
      masumiLog: auditEntry.id,
      masumiPaymentInfo: premium ? { amount: '0.5', currency: 'ADA', status: 'demo' } : null,
      category,
      analyticsSnapshot: analytics,
      responseTime: Date.now()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/analytics', (req, res) => {
  res.json(analytics);
});

app.listen(PORT, () => {
  console.log(`🚀 CardanoVault Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Query endpoint: http://localhost:${PORT}/api/query`);
});
