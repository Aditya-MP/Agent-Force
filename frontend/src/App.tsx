// @ts-nocheck
import { useState, useEffect, useRef } from 'react';


// ... (lines 8-204 remain unchanged)

import LoginPage from './components/LoginPage';
import MainLayout from './components/layout/MainLayout';
import './App.css';

// --- Types ---
interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  id: string;
}

interface WalletData {
  balance?: number;
  utxoCount?: number;
  utxos?: any[];
  [key: string]: any;
}

interface NetworkData {
  networkStatus?: string;
  blocks?: number;
  activePools?: number;
}

interface Pool {
  id: string;
  status: 'excellent' | 'good' | 'warning' | 'oversaturated' | 'new/low' | 'simulated';
  saturation: number;
  roa: string | number;
  margin: string | number;
  fixed_cost?: number;
  blocks_minted?: number;
  warning?: string | null;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState<WalletData>({});
  const [networkData, setNetworkData] = useState<NetworkData>({});
  const [recommendedPools, setRecommendedPools] = useState<Pool[]>([]);
  const [premiumMode, setPremiumMode] = useState(false);
  const [lastProof, setLastProof] = useState('');
  const [txId, setTxId] = useState('');
  const [txDiag, setTxDiag] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [adminMode, setAdminMode] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- API Handlers ---
  const checkBackendConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const res = await fetch(`/health`, { method: 'GET' });
      if (res.ok) setConnectionStatus('connected');
      else setConnectionStatus('disconnected');
    } catch (e) {
      setConnectionStatus('disconnected');
    }
  };

  const handleLogin = (address: string) => {
    setWalletAddress(address);
    setIsLoggedIn(true);
    fetchWalletData(address);
    fetchNetworkStats();
    fetchRecommendedPools();
  };

  const fetchWalletData = async (address: string) => {
    try {
      const res = await fetch(`/api/wallet/${address}`);
      const data = await res.json();
      setWalletData(data);
    } catch (e) {
      console.log('Wallet data fetch failed');
    }
  };

  const fetchNetworkStats = async () => {
    try {
      const res = await fetch(`/api/network-stats`);
      const data = await res.json();
      setNetworkData(data);
    } catch (e) {
      console.log('Network stats fetch failed');
    }
  };

  const fetchRecommendedPools = async () => {
    try {
      const res = await fetch(`/api/pools`);
      const data = await res.json();
      setRecommendedPools(data);
    } catch (e) {
      console.log('Pools fetch failed');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { text: input, isUser: true, timestamp: new Date(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setTyping(true);

    try {
      const startTime = Date.now();
      const res = await fetch(`/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentInput,
          walletAddress,
          premium: premiumMode
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const responseTime = Date.now() - startTime;

      if (data.walletData) setWalletData(data.walletData);
      if (data.network) setNetworkData(data.network);
      if (data.pools) setRecommendedPools(data.pools);

      setLastProof(data.proof?.hash || '');

      const prefix = premiumMode ? '[⭐ Premium Analysis]\n\n' : '';
      const suffix = `\n⚡ Response: ${responseTime}ms`;

      const aiMessage: Message = {
        text: `${prefix}${data.answer}${suffix}`,
        isUser: false,
        timestamp: new Date(),
        id: (Date.now() + 1).toString()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setConnectionStatus('connected');
        setTyping(false);
        setLoading(false);
      }, 600);

    } catch (e) {
      console.error('Chat error:', e);
      setConnectionStatus('disconnected');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `❌ Connection Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
          isUser: false,
          timestamp: new Date(),
          id: Date.now().toString()
        }]);
        setTyping(false);
        setLoading(false);
      }, 500);
    }
  };

  const diagnoseTx = async () => {
    if (!txId.trim()) return;
    setTxLoading(true);
    setTxDiag(null);

    try {
      const res = await fetch(`/api/troubleshoot-tx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: txId.trim() })
      });
      const data = await res.json();
      setTxDiag(data);
      setMessages(prev => [...prev, {
        text: `🔧 Troubleshooting Mode\n\n${data.answer}`,
        isUser: false,
        timestamp: new Date(),
        id: Date.now().toString()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        text: '🔧 Troubleshooting Mode\n\n❌ Could not analyze transaction.',
        isUser: false,
        timestamp: new Date(),
        id: Date.now().toString()
      }]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setTxId('');
    setTxDiag(null);
    setLastProof('');
    setInput('');
  };

  // --- Render Helpers ---
  const getPoolColor = (status: string, saturation: number) => {
    if (status === 'oversaturated' || saturation > 90) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (status === 'warning' || saturation > 75) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    if (status === 'excellent') return 'text-green-400 border-green-500/30 bg-green-500/10';
    return 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10';
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <MainLayout
      walletAddress={walletAddress}
      walletData={walletData}
      networkData={networkData}
      recommendedPools={recommendedPools}
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
      loading={loading}
      typing={typing}
      txId={txId}
      diagnoseTx={diagnoseTx}
      txLoading={txLoading}
      connectionStatus={connectionStatus}
      selectedPool={selectedPool}
      setSelectedPool={setSelectedPool}
      handleNewChat={handleNewChat}
    />
  );
}

export default App;
