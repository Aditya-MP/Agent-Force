require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { storeMasumiEntry } = require('./masumi-storage');

console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const app = express();
app.use(cors());
app.use(express.json());

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;
const PORT = 3001;

console.log('🔧 Configuration:');
console.log('- Port:', PORT);
console.log('- Blockfrost Key:', BLOCKFROST_KEY ? 'Present' : 'Missing');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Simple chatbot endpoint
app.post('/api/query', async (req, res) => {
  const { question, walletAddress, premium = false } = req.body;
  
  try {
    let answer = '';
    
    // Check if it's a Cardano-related question
    const lowerQuestion = question.toLowerCase();
    const isCardano = ['ada', 'cardano', 'stake', 'staking', 'pool', 'wallet', 'transaction', 'hi', 'hello', 'help'].some(keyword => lowerQuestion.includes(keyword));
    
    if (!isCardano) {
      answer = `🤖 Agent Forces: I'm specialized in Cardano blockchain assistance! I can help you with:

• 💰 Staking & Rewards (earn 4-5% APY)
• 🎯 Stake Pool Selection  
• 💳 Wallet Management & UTXOs
• 📊 Transaction Analysis
• 🏛️ Governance & Voting

Please ask me something about Cardano, ADA, or blockchain! 🚀`;
    } else {
      // Try Gemini API first
      try {
        const cardanoPrompt = `You are Agent Forces, a specialized Cardano blockchain assistant. Answer this question about Cardano: ${question}`;
        const result = await model.generateContent(cardanoPrompt);
        answer = result.response.text();
        console.log('✅ Gemini API success!');
      } catch (error) {
        console.log('❌ Gemini failed, using fallback');
        
        // Fallback responses
        if (lowerQuestion.includes('staking') || lowerQuestion.includes('stake')) {
          answer = `🤖 Agent Forces: Staking your ADA is like putting money in a high-yield savings account! 💰

✨ How it works:
• Delegate to a stake pool (no risk, keep your keys!)
• Earn ~4-5% rewards annually
• Rewards come every 5 days (epochs)
• Your ADA never leaves your wallet

🎯 Start by choosing a pool with 30-70% saturation and low fees!`;
        } else if (lowerQuestion.includes('pool')) {
          answer = `🤖 Agent Forces: Great question about stake pools! 🏊‍♂️

🎯 Look for pools with:
• 30-70% saturation (not oversaturated)
• Low fees (0-5% margin)
• Consistent block production
• Good community reputation

💡 Avoid pools over 90% saturated - rewards get reduced!`;
        } else if (lowerQuestion.includes('transaction') || lowerQuestion.includes('tx')) {
          answer = `🤖 Agent Forces: Transaction troubles? I can help! 🔧

🔍 Common issues:
• Stuck transactions: Usually resolve in 2-20 minutes
• High fees: Often due to many small UTXOs
• Failed transactions: Check validity window and balance

💡 Solutions:
• Wait 20 minutes for confirmation
• Check transaction hash on explorer
• Ensure sufficient balance + fees`;
        } else {
          answer = `🤖 Agent Forces: Hello! I'm your specialized Cardano assistant! 🚀

🎯 I can help with:
• 💰 Staking & rewards
• 🏊 Pool selection
• 💳 Wallet setup
• 📊 Transaction help
• 🏛️ Governance

Ask me anything about Cardano!`;
        }
      }
    }

    // Mock data for response
    const pools = [
      { id: 'pool1testnet', saturation: 45, margin: 3, roa: 4.2, status: 'good' },
      { id: 'pool2testnet', saturation: 32, margin: 2, roa: 4.8, status: 'excellent' }
    ];

    const network = {
      blocks: 156,
      txs24h: 12500,
      activePools: 2800,
      networkStatus: '🟢 Healthy'
    };

    const responseHash = crypto.SHA256(answer + Date.now()).toString();
    const auditEntry = storeMasumiEntry(responseHash, {
      question: question,
      walletConnected: !!walletAddress,
      premium,
      timestamp: new Date().toISOString()
    }, answer);

    res.json({
      answer,
      walletData: null,
      pools,
      network,
      proof: { hash: responseHash },
      masumiLog: auditEntry.id,
      category: 'other',
      responseTime: Date.now()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transaction troubleshooting endpoint
app.post('/api/troubleshoot-tx', async (req, res) => {
  const { txHash } = req.body;
  
  if (!txHash || txHash.length < 10) {
    return res.json({
      error: 'Invalid transaction hash format',
      answer: '❌ Invalid transaction hash. Please provide a valid Cardano transaction hash.'
    });
  }
  
  let cleanHash = txHash.trim().replace(/\s+/g, '');
  
  if (cleanHash.length > 64) {
    cleanHash = cleanHash.substring(0, 64);
  }
  
  if (cleanHash.length !== 64 || !/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return res.json({
      error: 'Invalid transaction hash format',
      answer: `❌ Invalid transaction hash format.

Received: "${txHash}" (${txHash.length} chars)
Cleaned: "${cleanHash}" (${cleanHash.length} chars)

Cardano transaction hashes must be exactly 64 hexadecimal characters.`
    });
  }
  
  try {
    // Try to get transaction from Blockfrost
    const txRes = await axios.get(
      `https://cardano-preview.blockfrost.io/api/v0/txs/${cleanHash}`,
      { headers: { project_id: BLOCKFROST_KEY }, timeout: 10000 }
    );
    
    const tx = txRes.data;
    
    let diagnosis = '';
    let status = 'success';
    
    if (tx.invalid_before || tx.invalid_hereafter) {
      const now = Math.floor(Date.now() / 1000);
      if (tx.invalid_hereafter && now > tx.invalid_hereafter) {
        diagnosis += '⏰ Transaction expired (invalid_hereafter constraint)\n';
        status = 'failed';
      }
    }
    
    if (tx.fees) {
      const feeAda = parseInt(tx.fees) / 1_000_000;
      diagnosis += `💰 Fee: ${feeAda.toFixed(6)} ADA\n`;
    }
    
    const answer = `🔍 Transaction Analysis: ${cleanHash.slice(0, 16)}...

📊 Status: ${status === 'success' ? '✅ Confirmed' : '❌ Failed'}
🏗️ Block: ${tx.block_height || 'Pending'}
📅 Time: ${tx.block_time ? new Date(tx.block_time * 1000).toLocaleString() : 'Pending'}

${diagnosis}

💡 Tip: Check your wallet for confirmation or try refreshing after a few minutes.`;
    
    res.json({
      answer,
      troubleshootMode: true,
      txData: {
        hash: cleanHash,
        status,
        block: tx.block_height,
        fees: tx.fees,
        timestamp: tx.block_time
      }
    });
    
  } catch (error) {
    console.error('Transaction troubleshoot error:', error);
    
    let errorAnswer = '';
    if (error.response?.status === 404) {
      errorAnswer = `🔍 Transaction ${cleanHash.slice(0, 16)}... not found

This could mean:
• Transaction is still pending in mempool
• Invalid transaction hash
• Transaction was on different network
• Transaction was never submitted

💡 Try again in a few minutes or check the hash.`;
    } else {
      errorAnswer = `❌ Unable to analyze transaction

Network error or API limit reached. Please try again later.`;
    }
    
    res.json({
      answer: errorAnswer,
      troubleshootMode: true,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Agent Forces Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Query endpoint: http://localhost:${PORT}/api/query`);
  console.log(`🔧 Troubleshoot endpoint: http://localhost:${PORT}/api/troubleshoot-tx`);
});