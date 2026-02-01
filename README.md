# 🚀 Agent Forces - Real-Time Cardano AI Assistant

A specialized AI chatbot that provides real-time assistance for Cardano blockchain questions, staking, pools, wallets, and transactions.

## ✨ Features

- **🤖 Real-Time Chat**: Instant responses to Cardano-related questions
- **🎯 Cardano-Only Focus**: Specialized knowledge base for ADA, staking, pools, UTXOs
- **📊 Live Wallet Analysis**: Real-time wallet scanning and balance checking
- **🔍 Transaction Diagnosis**: Troubleshoot failed or pending transactions
- **⭐ Premium Mode**: Detailed analysis with actionable recommendations
- **🔐 Audit Trail**: Cryptographic proof of all AI responses

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)
```bash
# Double-click start.bat or run:
start.bat
```
*This will automatically install dependencies and start both servers*

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### Option 3: Concurrent Start
```bash
# Install all dependencies
npm run install-all

# Start both servers
npm start
```

### Health Check
```bash
# Verify everything is running
check-health.bat
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 💬 What You Can Ask

### 🏦 Staking Questions
- "How do I start staking my ADA?"
- "Which stake pool should I choose?"
- "Why are my staking rewards low?"
- "When will I receive my first rewards?"

### 🎯 Pool Selection
- "What makes a good stake pool?"
- "How do I avoid oversaturated pools?"
- "What are pool fees and margins?"

### 💳 Wallet Management
- "Why are my transaction fees high?"
- "What are UTXOs and how do they work?"
- "How do I consolidate my UTXOs?"
- "Is my wallet balance correct?"

### 🔍 Transaction Help
- "My transaction is stuck, what happened?"
- "How long do Cardano transactions take?"
- "Why did my transaction fail?"

### 🏛️ Governance & DeFi
- "How does Cardano governance work?"
- "What is Project Catalyst?"
- "How do I participate in voting?"

## 🔧 Configuration

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and add your keys:
```
BLOCKFROST_KEY=your_blockfrost_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

### API Keys Setup
1. **Blockfrost**: Get free API key at https://blockfrost.io (for Cardano data)
2. **Gemini**: Get API key at https://aistudio.google.com (for AI responses)

*Note: The app works with fallback responses if API keys are missing*

## 🛡️ Security Features

- **No Data Storage**: All wallet scans are real-time, no data saved
- **Cryptographic Proofs**: Every AI response includes hash verification
- **Audit Logging**: Masumi audit trail for all interactions
- **Input Validation**: Cardano address format verification

## 🎯 Cardano-Only Policy

Agent Forces **ONLY** responds to Cardano-related questions:
- ✅ ADA, staking, pools, wallets, transactions
- ✅ Cardano DeFi, NFTs, smart contracts
- ✅ Governance, voting, Project Catalyst
- ❌ Other cryptocurrencies or general topics

## 🔄 Real-Time Features

- **Live Connection Status**: Shows if backend is connected
- **Typing Indicators**: Real-time chat experience
- **Response Time Tracking**: Performance monitoring
- **Auto-Reconnection**: Handles network interruptions
- **Live Wallet Updates**: Real-time balance and UTXO tracking

## 📱 Usage Tips

1. **Connect Your Wallet**: Enter a Cardano testnet address to get personalized advice
2. **Ask Specific Questions**: More specific questions get better answers
3. **Use Premium Mode**: Toggle for detailed analysis and action steps
4. **Check Audit Trail**: Verify AI response authenticity with proof hashes
5. **Monitor Connection**: Green dot = live, red dot = check backend

## 🛠️ Troubleshooting

### Quick Health Check
```bash
# Run the health check script
check-health.bat
```

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:3001/health

# Restart backend
cd backend && npm start
```

### Frontend Issues
```bash
# Clear cache and restart
cd frontend
rmdir /s node_modules
npm install
npm run dev
```

### Common Errors
- **"Backend error"**: Backend not running on port 3001 - run `start.bat`
- **"Invalid address"**: Use valid Cardano testnet address (addr_test1...)
- **"API quota exceeded"**: Gemini API limit reached, using intelligent fallbacks
- **Port conflicts**: Change PORT in `.env` if 3001/5173 are in use

## 🏗️ Architecture

```
Frontend (React + TypeScript + MUI) ←→ Backend (Node.js + Express) ←→ Blockfrost API
                                              ↓
                                       Gemini AI + Smart Fallbacks
                                              ↓
                                        Masumi Audit Trail
```

### Tech Stack
- **Frontend**: React 19, TypeScript, Material-UI, Vite
- **Backend**: Node.js, Express, Axios, Crypto-JS
- **AI**: Google Gemini 2.5 Flash with intelligent fallbacks
- **Blockchain**: Blockfrost API for Cardano data
- **Audit**: Masumi cryptographic proof system

## 📊 Monitoring

- Real-time connection status in header
- Response time tracking for each query  
- Audit trail with cryptographic proofs
- Network health monitoring

---

**🎯 Agent Forces**: Your specialized Cardano AI assistant - Ask anything about ADA! 🚀