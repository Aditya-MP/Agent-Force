import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Shield, Zap, Activity, Grid,
  Wallet, Settings, ChevronRight, AlertTriangle,
  CheckCircle, Loader, Terminal, Lock
} from 'lucide-react';
import LoginPage from './components/LoginPage';
import AdminAnalytics from './components/AdminAnalytics';
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
      const res = await fetch('http://localhost:3001/health', { method: 'GET' });
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
  };

  const fetchWalletData = async (address: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/wallet/${address}`);
      const data = await res.json();
      setWalletData(data);
    } catch (e) {
      console.log('Wallet data fetch failed');
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
      const res = await fetch('http://localhost:3001/api/query', {
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
      const res = await fetch('http://localhost:3001/api/troubleshoot-tx', {
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
    <div className="flex h-screen w-full bg-cyber-black text-gray-200 font-sans overflow-hidden selection:bg-neon-cyan selection:text-black">

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-neon-cyan/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-neon-purple/5 blur-[120px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="relative z-10 flex w-full h-full max-w-[1920px] mx-auto">

        {/* LEFT SIDEBAR - Navigation & Quick Actions */}
        <aside className="w-80 flex-shrink-0 flex flex-col border-r border-white/5 bg-glass-dark backdrop-blur-md">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-lg shadow-neon-cyan/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Agent Forces</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)]' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{connectionStatus}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Command Center</h3>

              <button
                onClick={() => setInput('Recommend me 3 good staking pools for my wallet')}
                className="w-full group relative p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-neon-cyan/10 hover:border-neon-cyan/30 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan group-hover:scale-110 transition-transform">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-neon-cyan transition-colors">Staking Ops</div>
                    <div className="text-xs text-gray-400">Optimize rewards</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setInput('Check my wallet balance and health')}
                className="w-full group relative p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-neon-purple/10 hover:border-neon-purple/30 transition-all duration-300 text-left"
              >
                <div className="relative flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-neon-purple transition-colors">Asset Scan</div>
                    <div className="text-xs text-gray-400">Deep wallet analysis</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setTxId('tx-hash-placeholder')}
                className="w-full group relative p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 text-left"
              >
                <div className="relative flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-red-400 transition-colors">Troubleshoot</div>
                    <div className="text-xs text-gray-400">Fix stuck TXs</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer - Admin Toggle */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <button
              onClick={() => setAdminMode(!adminMode)}
              className="flex items-center justify-center w-full py-2 gap-2 text-xs font-medium text-gray-500 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>{adminMode ? 'Exit Admin' : 'Admin Console'}</span>
            </button>
          </div>
        </aside>

        {/* CENTER & RIGHT CONTENT */}
        {adminMode ? (
          <AdminAnalytics />
        ) : (
          <>
            {/* CENTER - Chat Interface */}
            <main className="flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-black/20">

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth" ref={chatContainerRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center shadow-lg shadow-neon-cyan/5 animate-float">
                      <Terminal className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-white">Agent Forces Online</h2>
                    <p className="mt-2 text-gray-400 max-w-md">Secure. Intelligent. Autonomous.<br />Ready to assist with Cardano infrastructure operations.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm shadow-sm ${msg.isUser
                        ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-white rounded-br-sm'
                        : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-sm'
                        }`}>
                        {/* Decorators */}
                        {!msg.isUser && <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple/50" />}

                        <div className="whitespace-pre-wrap text-sm leading-relaxed font-light">{msg.text}</div>

                        <div className="mt-2 flex items-center gap-2 justify-end opacity-40 text-[10px] font-mono tracking-wider">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.isUser && <CheckCircle className="w-3 h-3" />}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {(loading || typing) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <Loader className="w-4 h-4 text-neon-cyan animate-spin" />
                      <span className="text-xs text-neon-cyan font-mono tracking-wider animate-pulse">
                        {typing ? 'DECRIPTING_INPUT...' : 'ANALYZING_CHAIN_DATA...'}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Troubleshoot Panel (Conditional) */}
              <AnimatePresence>
                {showTroubleshoot && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 bg-glass-dark border-t border-white/5 overflow-hidden"
                  >
                    <div className="py-4 flex gap-2 items-center">
                      <input
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="Enter Transaction Hash..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-neon-cyan focus:outline-none focus:border-neon-cyan/50"
                      />
                      <button
                        onClick={diagnoseTx}
                        disabled={txLoading || !txId.trim()}
                        className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors text-sm font-bold flex items-center gap-2"
                      >
                        {txLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        Analyze
                      </button>
                      <button
                        onClick={() => setShowTroubleshoot(false)}
                        className="p-2 text-gray-500 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    {txDiag && (
                      <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg mb-4 text-sm text-neon-cyan">
                        <strong>Diagnosis:</strong> {txDiag.answer || 'Analysis complete.'}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-6 border-t border-white/5 bg-glass-dark backdrop-blur-xl">
                <div className="relative max-w-4xl mx-auto w-full">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Terminal className={`w-5 h-5 transition-colors ${loading ? 'text-neon-cyan' : 'text-gray-500'}`} />
                  </div>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                    placeholder="Execute command or ask question..."
                    disabled={loading}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all font-mono text-sm"
                  />

                  <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                    {/* Add Troubleshoot Toggle */}
                    <button
                      onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                      className={`p-2 rounded-lg transition-colors ${showTroubleshoot ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/5 text-gray-500'}`}
                      title="Troubleshoot Transaction"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>

                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                      <Lock className={`w-3 h-3 ${premiumMode ? 'text-neon-purple' : 'text-gray-500'}`} />
                      <span className={`text-[10px] font-bold tracking-wider uppercase cursor-pointer select-none ${premiumMode ? 'text-white' : 'text-gray-500'}`} onClick={() => setPremiumMode(!premiumMode)}>
                        {premiumMode ? 'PRO' : 'LITE'}
                      </span>
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="p-2 rounded-lg bg-neon-cyan text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Tx Diagnosis Inline */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-pointer border-b border-transparent hover:border-gray-500">
                    <Activity className="w-3 h-3" />
                    <span>Network Latency: 42ms</span>
                  </div>
                </div>
              </div>
            </main>

            {/* RIGHT SIDEBAR - Analytics */}
            <aside className="w-[340px] flex-shrink-0 border-l border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Wallet Card */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Live Asset Data
                  </h3>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 p-5 group hover:border-neon-cyan/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/10 blur-3xl -mr-10 -mt-10" />

                    <div className="text-gray-400 text-xs font-mono mb-1">Total Balance</div>
                    <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
                      {walletData.balance?.toLocaleString() || 0}
                      <span className="text-sm font-normal text-neon-cyan">ADA</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs">
                      <div className="text-gray-500">UTXO Set</div>
                      <div className="text-white font-mono">{walletData.utxoCount || 0} inputs</div>
                    </div>
                  </div>
                </div>

                {/* Network Status */}
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Chain Health
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-sm text-gray-300">Epoch Status</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                        {networkData?.networkStatus || 'SYNCED'}
                      </span>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-500">
                      <div className="text-center">
                        <div className="text-white font-mono font-bold text-sm">{networkData?.blocks || 0}</div>
                        <div>Blocks</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <div className="text-white font-mono font-bold text-sm">{networkData?.activePools || 0}</div>
                        <div>Pools</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staking Recommendations */}
                <div className="p-6 flex-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Top Pools
                  </h3>

                  <div className="space-y-3">
                    {recommendedPools.length > 0 ? (
                      recommendedPools.slice(0, 3).map((pool, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedPool(pool)}
                          className={`p-3 rounded-xl border transition-all hover:translate-x-1 cursor-pointer active:scale-95 ${getPoolColor(pool.status, pool.saturation)}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm tracking-wide">{pool.id?.slice(0, 10)}...</span>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                          </div>
                          <div className="flex justify-between text-[10px] uppercase font-bold opacity-80">
                            <span>ROA {pool.roa}%</span>
                            <span>Fee {pool.margin}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600 text-sm italic border border-dashed border-white/10 rounded-xl">
                        Awaiting query data...
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Log */}
                {lastProof && (
                  <div className="p-4 bg-black/40 text-[10px] text-gray-600 font-mono break-all border-t border-white/5">
                    <div className="flex items-center gap-2 mb-1 text-neon-purple">
                      <CheckCircle className="w-3 h-3" />
                      <span className="font-bold">VERIFIED PROOF</span>
                    </div>
                    {lastProof}
                  </div>
                )}

              </div>
            </aside>
          </>
        )}

      </div>

      {/* Pool Details Modal */}
      <AnimatePresence>
        {selectedPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Pool Details</h3>
                  <div className="font-mono text-xs text-gray-400 break-all">{selectedPool.id}</div>
                </div>
                <button
                  onClick={() => setSelectedPool(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Grid className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Est. ROA</div>
                    <div className="text-2xl font-bold text-neon-green">{selectedPool.roa}%</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Saturation</div>
                    <div className={`text-2xl font-bold ${selectedPool.saturation > 80 ? 'text-red-400' : 'text-blue-400'}`}>
                      {selectedPool.saturation}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span>Variable Fee (Margin)</span>
                    <span className="font-mono font-bold">{selectedPool.margin}%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span>Fixed Cost</span>
                    <span className="font-mono font-bold">{selectedPool.fixed_cost || '340'} ADA</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span>Blocks Minted (Epoch)</span>
                    <span className="font-mono font-bold">{selectedPool.blocks_minted || 0}</span>
                  </div>
                </div>

                {selectedPool.warning && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-orange-200">{selectedPool.warning}</p>
                  </div>
                )}

                <button
                  className="w-full py-3 bg-neon-purple hover:bg-neon-purple/80 text-black font-bold rounded-xl transition-all"
                  onClick={() => window.open(`https://preview.cardanoscan.io/pool/${selectedPool.id}`, '_blank')}
                >
                  View on Explorer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
