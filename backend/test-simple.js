require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto-js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Simple test endpoint
app.post('/api/query', async (req, res) => {
  try {
    console.log('📥 Received query:', req.body);
    
    const { question, premium = false } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Simple response based on question
    let answer = '';
    if (question.toLowerCase().includes('stake') || question.toLowerCase().includes('staking')) {
      answer = premium 
        ? `[⭐ Premium Analysis]

🤖 Agent Forces: Staking your ADA is like putting money in a high-yield savings account! 💰

✨ How it works:
• Delegate to a stake pool (no risk, keep your keys!)
• Earn ~4-5% rewards annually  
• Rewards come every 5 days (epochs)
• Your ADA never leaves your wallet

🎯 Premium Action Steps:
1. Choose a pool with 0-60% saturation
2. Delegate using your wallet (costs ~2.17 ADA once)
3. Wait 15-20 days for first rewards

💰 Premium payment: 0.10 USDM (mocked)`
        : `🤖 Agent Forces: Staking your ADA is like putting money in a high-yield savings account! 💰

✨ How it works:
• Delegate to a stake pool (no risk!)
• Earn ~4-5% rewards annually
• Your ADA never leaves your wallet`;
    } else {
      answer = `🤖 Agent Forces: Great Cardano question! 🚀

I'm here to help with everything Cardano:
• 💰 Staking & rewards
• 🎯 Pool selection  
• 💳 Wallet management
• 📊 Transaction help

Ask me about staking, pools, or transactions!`;
    }

    // Mock payment info
    const masumiPaymentInfo = premium ? {
      status: "mocked",
      currency: "USDM", 
      amount: 0.10,
      note: "Demo payment"
    } : null;

    // Create hash
    const hash = crypto.SHA256(answer).toString();

    console.log('✅ Query processed successfully');

    res.json({
      answer,
      proof: { hash: hash.slice(0, 16) },
      masumiLog: `MASUMI_${hash.slice(0, 12)}`,
      premium,
      masumiPaymentInfo,
      walletData: { balance: 10000, utxoCount: 5 },
      pools: [{ id: 'pool1', saturation: 45, margin: 3 }],
      network: { networkStatus: '🟢 Healthy' }
    });

  } catch (e) {
    console.error('❌ Error:', e.message);
    res.status(500).json({ error: 'Server error', details: e.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'success', message: '✅ Test Server Running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Backend running on http://localhost:${PORT}`);
  console.log(`✅ Ready for testing`);
});