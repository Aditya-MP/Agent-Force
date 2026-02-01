# 🚀 Agent Forces - Real-Time Cardano AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

A specialized AI assistant for the Cardano blockchain ecosystem, providing real-time wallet analysis, staking recommendations, transaction troubleshooting, and comprehensive blockchain insights.

## ✨ Features

### 🤖 AI-Powered Chat System
- **Cardano-Specialized AI**: Powered by Google Gemini with intelligent fallbacks
- **Real-time Responses**: Instant answers to Cardano-related questions
- **Beginner-Friendly**: Simple explanations with analogies
- **FAQ System**: Instant responses for common questions
- **Premium Mode**: Enhanced analysis with detailed recommendations

### 💳 Wallet Integration
- **Live Wallet Scanning**: Real-time balance and UTXO analysis via Blockfrost API
- **Multi-Network Support**: Preview, Preprod, and Mainnet compatibility
- **Token Detection**: Native token and NFT identification
- **Transaction History**: Complete transaction analysis
- **Security-First**: No private keys required - address-only analysis

### 🏊 Staking & Pool Analysis
- **Smart Pool Recommendations**: AI-driven stake pool suggestions
- **Oversaturation Warnings**: Real-time pool saturation monitoring
- **Reward Projections**: Estimated staking returns (4-5% APY)
- **Pool Performance Metrics**: ROA, fees, and reliability analysis
- **Delegation Status**: Current staking information

### 🔧 Transaction Troubleshooting
- **Automatic Hash Detection**: AI detects transaction hashes in conversations
- **Multi-Network Search**: Searches across all Cardano networks
- **Failure Analysis**: Exact failure reasons with solutions
- **Mempool Monitoring**: Check for pending transactions
- **Fee Analysis**: High fee detection and optimization suggestions

### 📊 Advanced Analytics
- **Admin Dashboard**: Query analytics and usage statistics
- **Audit Trail**: Cryptographic verification of all responses (Masumi system)
- **Risk Assessment**: Wallet risk scoring and recommendations
- **Performance Monitoring**: Real-time system health checks

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Google Gemini AI** for natural language processing
- **Blockfrost API** for Cardano blockchain data
- **Crypto-JS** for cryptographic operations
- **Axios** for HTTP requests

### Frontend
- **React 19** with TypeScript
- **Material-UI (MUI)** for modern UI components
- **Vite** for fast development and building
- **Lucide React** for icons

### APIs & Services
- **Blockfrost**: Cardano blockchain data provider
- **Google Gemini**: AI language model
- **Masumi**: Audit trail and verification system

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Blockfrost API key ([Get one here](https://blockfrost.io))
- Google Gemini API key ([Get one here](https://aistudio.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditya-MP/Agent-Force.git
   cd Agent-Force
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env` with your API keys:
   ```env
   BLOCKFROST_KEY=your_blockfrost_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm start
   ```

   This will start both backend (port 3001) and frontend (port 5173) concurrently.

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 📖 Usage Guide

### Basic Chat
1. Open the application in your browser
2. Start asking Cardano-related questions:
   - "What is staking?"
   - "How do I choose a stake pool?"
   - "Explain UTXOs"

### Wallet Analysis
1. Click "Connect Wallet" in the right panel
2. Enter your Cardano address (testnet or mainnet)
3. Get real-time balance, UTXO count, and staking status
4. Ask personalized questions about your wallet

### Transaction Troubleshooting
1. Paste a transaction hash in the chat
2. Agent Forces automatically detects and analyzes it
3. Get detailed failure reasons and solutions
4. Use the dedicated troubleshoot feature for deep analysis

### Premium Features
1. Toggle "Premium Mode" for enhanced analysis
2. Get detailed recommendations and action steps
3. Access advanced wallet risk assessment

## 🔌 API Endpoints

### Chat & Query
```http
POST /api/query
Content-Type: application/json

{
  "question": "What is the best stake pool?",
  "walletAddress": "addr1...",
  "premium": false
}
```

### Wallet Refresh
```http
POST /api/refresh-wallet
Content-Type: application/json

{
  "address": "addr1..."
}
```

### Transaction Analysis
```http
POST /api/troubleshoot-tx
Content-Type: application/json

{
  "txHash": "f3db1c5c95ca..."
}
```

### Admin Analytics
```http
GET /api/admin/analytics
```

## 🏗️ Project Structure

```
Agent-Force/
├── backend/                 # Node.js backend
│   ├── index.js            # Main server file
│   ├── masumi-storage.js   # Audit trail system
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── package.json            # Root package.json
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## 🔐 Security Features

- **No Private Keys**: Only public addresses are used
- **API Key Protection**: Environment variables for sensitive data
- **Audit Trail**: Cryptographic verification of all responses
- **Input Validation**: Comprehensive validation of all inputs
- **Rate Limiting**: Built-in protection against abuse

## 🌐 Network Support

- **Mainnet**: Production Cardano network
- **Preview Testnet**: Testing environment
- **Preprod Testnet**: Pre-production testing

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
rm -rf node_modules
npm install
npm run dev
```

### Common Errors
- **"Backend error"**: Backend not running on port 3001 - run `start.bat`
- **"Invalid address"**: Use valid Cardano testnet address (addr_test1...)
- **"API quota exceeded"**: Gemini API limit reached, using intelligent fallbacks
- **Port conflicts**: Change PORT in `.env` if 3001/5173 are in use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Aditya-MP/Agent-Force/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our discussions in GitHub Discussions

## 🙏 Acknowledgments

- **Cardano Foundation** for the amazing blockchain
- **Blockfrost** for reliable API services
- **Google** for Gemini AI capabilities
- **Material-UI** for beautiful components
- **React Team** for the excellent framework

## 📊 Demo & Screenshots

### Main Interface
- Clean 3-panel layout with chat, info panel, and wallet panel
- Real-time typing indicators and smooth animations
- Material Design components for modern UX

### Key Features Demo
1. **AI Chat**: Ask "What is staking?" and get detailed explanations
2. **Wallet Analysis**: Connect wallet to see live balance and UTXOs
3. **Pool Recommendations**: Get personalized stake pool suggestions
4. **Transaction Help**: Paste a tx hash for instant analysis
5. **Admin Panel**: View query analytics and system stats

---

**Built with ❤️ for the Cardano Community**