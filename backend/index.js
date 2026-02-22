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
    // Switched to 2.5-flash for updated capabilities
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini AI initialized (Model: gemini-2.5-flash)');
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
    let totalValue = 0;

    // 🎨 AGENT: Asset Detective
    let assetStats = {
      nfts: 0,
      tokens: 0,
      uniquePolicies: new Set()
    };

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
          // Asset Detective Logic
          const amount = parseInt(asset.quantity);
          if (amount === 1) {
            assetStats.nfts++;
            console.log(`    🎨 NFT Detected: ${asset.unit}`);
          } else {
            assetStats.tokens++;
            console.log(`    🪙 Token Detected: ${asset.unit} (${amount})`);
          }
          assetStats.uniquePolicies.add(asset.unit.substring(0, 56)); // Policy ID is first 56 chars
        }
      });
    });

    const finalBalance = Math.round(adaBalance * 1_000_000) / 1_000_000;
    console.log(`💰 Total Balance: ${finalBalance} ADA (${totalValue} lovelace)`);

    // 💰 AGENT: Fee Optimizer
    // Calculate theoretical cost to send all assets now (many inputs) vs after consolidation (1 input)
    // Cardano fee approx: 0.17 ADA + 0.000044 per byte
    // Standard Tx ~ 1 input, 2 outputs. Complex ~ N inputs.
    const BYTE_COST = 0.000044;
    const BASE_FEE = 0.17;
    const INPUT_SIZE_BYTES = 148; // Approx size of an input

    const currentCost = BASE_FEE + (utxos.length * INPUT_SIZE_BYTES * BYTE_COST);
    const optimizedCost = BASE_FEE + (1 * INPUT_SIZE_BYTES * BYTE_COST);
    const potentialSavings = Math.max(0, currentCost - optimizedCost);

    console.log(`💸 Fee Optimizer: Current Cost=${currentCost.toFixed(4)}, Optimized=${optimizedCost.toFixed(4)}, Savings=${potentialSavings.toFixed(4)}`);

    return {
      balance: finalBalance,
      utxoCount: utxos.length,
      hasTokens: assetStats.tokens > 0,
      hasNfts: assetStats.nfts > 0,
      assetStats: {
        nfts: assetStats.nfts,
        tokens: assetStats.tokens,
        policies: assetStats.uniquePolicies.size
      },
      feeOptimizer: {
        currentCostEstimate: currentCost.toFixed(4),
        potentialSavings: potentialSavings.toFixed(4),
        recommendation: potentialSavings > 0.5 ? 'URGENT_CONSOLIDATION_NEEDED' :
          potentialSavings > 0.2 ? 'RECOMMENDED' : 'OPTIMIZED'
      },
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

    // 🛡️ AGENT: Saturation Guardian & Pool Hunter
    // Filter logic:
    // 1. Remove dangerous pools (>95% saturation) - Saturation Guardian
    // 2. Rank remaining by ROA and Margin - Pool Hunter

    const validPools = results.filter(p => p !== null);

    const safePools = validPools.filter(pool => {
      const isDangerous = pool.saturation > 95;
      if (isDangerous) {
        console.log(`🛡️ Saturation Guardian: BLOCKED pool ${pool.id} (Saturation: ${pool.saturation}%)`);
      }
      return !isDangerous;
    });

    return safePools.map(pool => ({
      ...pool,
      warning: pool.saturation > 85 ? 'High saturation (Guardian Warning)' : null,
      guardianScore: pool.saturation < 70 && pool.margin < 2 ? 'PERFECT' : 'GOOD'
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

async function callLLM(prompt, originalQuestion, isPremium) {
  if (!isCardanoRelated(originalQuestion)) {
    return `I am specialized in Cardano blockchain assistance. I can help you with:\n\n- Staking & Rewards (earn 4-5% APY)\n- Stake Pool Selection\n- Wallet Management & UTXOs\n- Transaction Analysis\n- Governance & Voting\n- DeFi & Smart Contracts\n\nPlease ask me something about Cardano, ADA, or blockchain.`;
  }

  if (!model) {
    console.log('⚠️ Gemini not available - using fallback');
    return getCardanoFallbackResponse(originalQuestion, prompt, isPremium);
  }

  // 🎭 SYSTEM INSTRUCTIONS
  const SYSTEM_INSTRUCTION_NORMAL = `You are a Helpful Cardano Guide.
GOAL: Explain things simply and clearly. Make it easy for a beginner to understand.

FORMATTING RULES:
- **NO BOT PREFIXES:** Start directly with your answer.
- **NO MARKDOWN:** Do not use bold characters (**text**), italics, or special headers. Use simple spacing and hyphens (-) for lists if needed.
- **Style:**
  - Use natural, conversational language.
  - Avoid complex jargon. If you must use a technical term, explain it simply.
  - Focus on the "big picture" first, then add details if helpful.
- **Tone:** Friendly, Patient, and Clear.
- NEVER mention or display wallet addresses.`;

  const SYSTEM_INSTRUCTION_PREMIUM = `You are a Senior Blockchain Strategist.
GOAL: Provide deep insights but keep them accessible and clear.

FORMATTING RULES:
- **NO BOT PREFIXES:** Start directly with the summary.
- **NO MARKDOWN:** Do not use bold characters. Use CAPS for major sections if needed.
- **Structure:**
  EXECUTIVE SUMMARY
  (Direct answer to the user's question)
  
  ANALYSIS
  (Deeper look at the mechanics or data)
  
  STRATEGY
  (Actionable advice)
  
  RISK CHECK
  (Potential downsides)
- NEVER mention or display wallet addresses.`;

  const systemInstruction = isPremium ? SYSTEM_INSTRUCTION_PREMIUM : SYSTEM_INSTRUCTION_NORMAL;

  let lastError = null;
  // Increased to 4 attempts to allow for longer backoff (2s -> 4s -> 8s)
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      console.log(`🚀 Calling Gemini API (attempt ${attempt}/4)... [Premium: ${isPremium}]`);

      const cardanoPrompt = `${systemInstruction}

CONTEXT DATA:
${prompt}

USER QUESTION:
${originalQuestion}`;

      const result = await model.generateContent(cardanoPrompt);
      const text = result.response.text();
      console.log('✅ Gemini API success!');
      return text;
    } catch (error) {
      lastError = error;
      console.log(`❌ Attempt ${attempt} failed:`, error.message);

      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        // Log valid stringified data if possible, else just message
        try { console.log(`   Data: ${JSON.stringify(error.response.data)}`); } catch (e) { }
      }

      if (attempt < 4) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay / 1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.log('❌ All Gemini attempts failed - Using intelligent fallback...');
  return getCardanoFallbackResponse(originalQuestion, prompt, isPremium);
}

function getCardanoFallbackResponse(question, prompt, isPremium = false) {
  const lowerQuestion = question.toLowerCase();
  const balance = prompt.match(/Balance: (\d+(?:\.\d+)?) ADA/)?.[1] || '0';

  // POOLS
  if (lowerQuestion.includes('pool') || lowerQuestion.includes('stake pool')) {
    return `Think of a Stake Pool like a server that does the hard work of validating the network for you. By delegating your ADA to a pool, you help secure Cardano and earn rewards, kind of like interest in a bank account.

When picking a pool, here is what matters:

- Saturation: You want a pool that isn't too full (below 60% is good). If it gets over 95%, your rewards actually drop.
- Fees: Look for low fees. Most pools charge a small % (margin) of the profits. Lower is usually better for you.
- Reliability: You want a pool that is online 100% of the time so you don't miss out on rewards.`;
  }

  // TRANSACTIONS
  if (lowerQuestion.includes('transaction') || lowerQuestion.includes('tx ') || lowerQuestion.includes('stuck') || lowerQuestion.includes('fail')) {
    const hashMatch = question.match(/\b[a-fA-F0-9]{60,66}\b/);

    if (hashMatch) {
      const detectedHash = hashMatch[0].length > 64 ? hashMatch[0].substring(0, 64) : hashMatch[0];
      return `I see a transaction hash: ${detectedHash.slice(0, 16)}...

Here is what is likely happening:
- If it is "Pending", the network might just be busy. It usually clears up in 5-20 minutes.
- If it "Failed", check if you had enough ADA to cover the transaction fee.
- If it is "Confirmed", then it is done and on the blockchain forever.

You can use the Troubleshoot tool to check the exact status of this hash.`;
    } else {
      return `If you are having trouble with a transaction, don't worry. Cardano is designed so your funds are never "lost" in the middle. They are either in your wallet or they arrive at the destination.

- Stuck? It's probably just network traffic. Give it a few minutes.
- Failed? Usually means you didn't have quite enough ADA for the fee. Check your balance.`;
    }
  }

  // STAKING
  if (lowerQuestion.includes('staking') || lowerQuestion.includes('stake')) {
    const balanceMsg = parseFloat(balance) >= 10
      ? "It looks like you have enough ADA to start. You can pick a pool and start earning rewards right away."
      : "I recommend getting at least 10 ADA before you start, just to cover the small deposit and fees.";

    return `Staking is how you earn rewards on Cardano. It is very safe because your ADA never leaves your wallet. You are just "voting" with your ADA to say "I trust this pool to do a good job."

How it works:
1. You choose a pool in your wallet (Delegation).
2. You wait a bit. It takes about 15-20 days for the first rewards to arrive.
3. After that, you get rewards automatically every 5 days.

${balanceMsg}`;
  }

  // ADA / CURRENCY
  if (lowerQuestion.includes('ada') || lowerQuestion.includes('what is ada') || lowerQuestion.includes('native token')) {
    return `ADA is the native cryptocurrency of Cardano. It is named after Ada Lovelace, the first computer programmer.

You can use ADA to:
- Send money to anyone in the world instantly and cheaply.
- Stake it to earn rewards (like interest).
- Vote on the future of the network.
- Pay for transaction fees.

It is more than just money; it is the "fuel" that runs the entire Cardano computer.`;
  }

  // DEFAULT
  return `I am your friendly Cardano Guide.

I can help you understand things like:
- Staking: How to earn rewards safe and easy.
- Pools: How to pick a good one.
- Transactions: What to do if something gets stuck.
- Governance: How voting works.

Just ask me anything about Cardano!`;
}

async function postMasumiLog(hash, metadata, answer) {
  const entry = await storeMasumiEntry(hash, metadata, answer);
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

      // Add Agent Detective Report
      if (walletData.assetStats) {
        prompt += `- Asset Breakdown: ${walletData.assetStats.nfts} NFTs, ${walletData.assetStats.tokens} Tokens\n`;
      }

      // Add Fee Optimizer Report
      if (walletData.feeOptimizer) {
        prompt += `- Fee Optimization: ${walletData.feeOptimizer.recommendation}\n`;
        prompt += `  (Potentially save ${walletData.feeOptimizer.potentialSavings} ADA by consolidating)\n`;
      }

      prompt += `- Last updated: ${new Date(walletData.lastUpdated).toLocaleTimeString()}\n`;
      prompt += `- Scan time: ${walletData.scanTime}\n\n`; // End of chunk
    }

    if (premium) {
      prompt += `Premium Analysis Requested - Provide detailed recommendations and action steps.\n\n`;
    }

    prompt += `Network Status: ${network.networkStatus}\n`;
    prompt += `Active Pools: ${network.activePools}\n\n`;

    let answer = await callLLM(prompt, question, premium);

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
      masumiLog: auditEntry.txHash,
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

app.get('/api/wallet/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const walletData = await getWalletSummary(address);
    res.json(walletData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/network-stats', async (req, res) => {
  try {
    const stats = await getNetworkStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pools', async (req, res) => {
  try {
    const pools = await getRecommendedPools();
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CardanoVault Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Query endpoint: http://localhost:${PORT}/api/query`);
});
