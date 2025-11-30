import React, { useState, useEffect, useRef } from 'react';
import { Box, AppBar, Toolbar, Typography, Chip } from '@mui/material';
import LoginPage from './components/LoginPage';
import AdminAnalytics from './components/AdminAnalytics';
import {
  Paper, TextField, Button, Divider, IconButton,
  CircularProgress
} from '@mui/material';
import { Send, Refresh, AdminPanelSettings } from '@mui/icons-material';
import './App.css';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState<any>({});
  const [networkData, setNetworkData] = useState<any>({});
  const [recommendedPools, setRecommendedPools] = useState<any[]>([]);
  const [premiumMode, setPremiumMode] = useState(false);
  const [lastProof, setLastProof] = useState('');
  const [lastMasumiLog, setLastMasumiLog] = useState('');
  const [txId, setTxId] = useState('');
  const [txDiag, setTxDiag] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    setShowScrollTop(scrollTop > 200);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkBackendConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const res = await fetch('http://localhost:3001/health', { 
        method: 'GET'
      });
      if (res.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (e) {
      setConnectionStatus('disconnected');
    }
  };

  const handleLogin = (address: string) => {
    setWalletAddress(address);
    setIsLoggedIn(true);
    // Fetch initial wallet data
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

    const userMessage: Message = { text: input, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setTyping(true);

    // Simulate real-time typing with delay
    setTimeout(() => setTyping(false), 1000);

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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const responseTime = Date.now() - startTime;

      // Update dashboard data from backend
      if (data.walletData) setWalletData(data.walletData);
      if (data.network) setNetworkData(data.network);
      if (data.pools) setRecommendedPools(data.pools);

      // Save audit info
      setLastProof(data.proof?.hash || '');
      setLastMasumiLog(data.masumiLog || '');

      const prefix = premiumMode ? '[⭐ Premium Analysis]\n\n' : '';
      const faqIndicator = data.source === 'faq' ? '\n\n📚 Answered from Project FAQ (plugin mode)' : '';
      const paymentInfo = data.masumiPaymentInfo ? `\n\n💰 Premium payment: ${data.masumiPaymentInfo.amount} ${data.masumiPaymentInfo.currency} (${data.masumiPaymentInfo.status})` : '';
      const auditSuffix = data.source === 'faq' ? '' : `\n\n💎 Proof: ${data.proof?.hash}\n📝 Masumi Log: ${data.masumiLog}`;
      const suffix = `${faqIndicator}${paymentInfo}${auditSuffix}\n⚡ Response: ${responseTime}ms`;
      
      const aiMessage: Message = { 
        text: `${prefix}${data.answer}${suffix}`, 
        isUser: false, 
        timestamp: new Date() 
      };
      
      // Add slight delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setConnectionStatus('connected');
      }, 500);
      
    } catch (e) {
      console.error('Chat error:', e);
      setConnectionStatus('disconnected');
      const errorMessage: Message = {
        text: `❌ Connection Error: ${e instanceof Error ? e.message : 'Unknown error'}\n\n🔧 Troubleshooting:\n• Check if backend is running on port 3001\n• Try: cd backend && npm start\n• Refresh the page`,
        isUser: false,
        timestamp: new Date()
      };
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
      }, 500);
    } finally {
      setLoading(false);
      setTyping(false);
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

      // Add troubleshooting result as a bot message with special label
      const troubleshootMessage = {
        text: `🔧 Troubleshooting Mode\n\n${data.answer}`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, troubleshootMessage]);
      
    } catch (e) {
      console.error('Troubleshoot error:', e);
      const errorMessage = {
        text: '🔧 Troubleshooting Mode\n\n❌ Could not analyze transaction. Please check if the backend is running and try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTxLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🚀 Agent Forces Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton 
              onClick={() => setAdminMode(!adminMode)}
              sx={{ color: 'white' }}
              title="Toggle Admin View"
            >
              <AdminPanelSettings />
            </IconButton>
            <Chip 
              label={connectionStatus === 'connected' ? '🟢 Live' : connectionStatus === 'connecting' ? '🟡 Connecting' : '🔴 Offline'}
              color={connectionStatus === 'connected' ? 'success' : connectionStatus === 'connecting' ? 'warning' : 'error'}
              size="small"
            />
            <Chip 
              label={`${walletData.balance || 0} ADA • ${walletAddress.slice(0,8)}...`} 
              color="success" 
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', p: 2, gap: 2 }}>
        {adminMode ? (
          <AdminAnalytics />
        ) : (
          <>
        {/* LEFT: Info Panel */}
        <Paper sx={{ width: '25%', p: 3, height: '100%', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>ℹ️ Quick Guide</Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ spaceY: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>💰 Staking</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Delegate → Earn 4-5% APY
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>🎯 Pools</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Choose 0-60% saturation
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>💳 UTXOs</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Like cash notes in wallet
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* MIDDLE: AI Chat */}
        <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom align="center">
            💬 Agent Forces AI
          </Typography>
          
          <Box 
            ref={chatContainerRef}
            onScroll={handleScroll}
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              mb: 2, 
              p: 2, 
              bgcolor: '#f8f9ff', 
              borderRadius: 2, 
              minHeight: 0,
              maxHeight: '60vh',
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
            }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                <Typography variant="h6" gutterBottom>💬 Welcome to Agent Forces!</Typography>
                <Typography gutterBottom>Your specialized Cardano AI assistant</Typography>
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f8ff', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Try asking:</Typography>
                  <Typography variant="body2">• "How do I start staking my ADA?"</Typography>
                  <Typography variant="body2">• "Which stake pool should I choose?"</Typography>
                  <Typography variant="body2">• "Why are my transaction fees high?"</Typography>
                  <Typography variant="body2">• "What are UTXOs and how do they work?"</Typography>
                </Box>
              </Box>
            ) : (
              messages.map((msg, i) => (
                <Box key={i} sx={{ mb: 2, display: 'flex', justifyContent: msg.isUser ? 'flex-end' : 'flex-start' }}>
                  <Paper sx={{ 
                    p: 2, 
                    maxWidth: '75%', 
                    bgcolor: msg.isUser ? '#1a237e' : '#e3f2fd',
                    color: msg.isUser ? 'white' : 'black',
                    borderRadius: msg.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.text}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            {(loading || typing) && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd', maxWidth: '70%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {typing ? '🤖 Agent Forces is typing...' : '🔍 Analyzing your Cardano question...'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
            
            {/* Scroll to Top Button */}
            {showScrollTop && (
              <IconButton
                onClick={scrollToTop}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: '#1a237e',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#303f9f',
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 1000
                }}
                size="small"
              >
                <Refresh sx={{ transform: 'rotate(180deg)' }} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              fullWidth 
              variant="outlined" 
              placeholder="Ask about ADA, staking, pools..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && connectionStatus !== 'disconnected' && sendMessage()}
              disabled={connectionStatus === 'disconnected'}
              helperText={connectionStatus === 'disconnected' ? 'Backend disconnected - check if server is running' : ''}
            />
            <Button 
              variant="contained" 
              onClick={sendMessage} 
              disabled={loading || !input.trim() || connectionStatus === 'disconnected'}

            >
              <Send />
            </Button>
          </Box>

          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={premiumMode ? 'Premium analysis: ON (demo)' : 'Premium analysis: OFF'}
              color={premiumMode ? 'warning' : 'default'}
              onClick={() => setPremiumMode(!premiumMode)}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
            <Typography variant="caption" color="text.secondary">
              Premium = deeper explanation and extra tips (demo only)
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#eef2ff' }}>
            <Typography variant="subtitle2" gutterBottom>
              🧪 Troubleshoot a transaction
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              Paste a Cardano preview tx hash to get a quick diagnosis.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tx hash (e.g. 3b9c... )"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={diagnoseTx}
                disabled={txLoading || !txId.trim()}
              >
                {txLoading ? 'Checking…' : 'Check'}
              </Button>
            </Box>
            {txDiag && (
              <Box sx={{ mt: 1, p: 1, bgcolor: txDiag.error ? '#ffebee' : '#e8f5e8', borderRadius: 1 }}>
                <Typography variant="caption" display="block" color={txDiag.error ? 'error.main' : 'success.main'}>
                  {txDiag.error ? '❌ Analysis failed' : '✅ Analysis complete'}
                </Typography>
                {txDiag.troubleshootMode && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    Check chat for detailed troubleshooting steps
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* RIGHT: Wallet + Analytics Panel */}
        <Paper sx={{ width: '25%', p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            <Typography variant="h6" gutterBottom>💼 Analytics</Typography>
            <Divider sx={{ mb: 3 }} />

          {/* Wallet Summary */}
          <Box sx={{ mb: 3 }}>
            <Chip label="✅ Connected" color="success" size="small" sx={{ mb: 1 }} />
            <Typography variant="body2"><strong>Address:</strong></Typography>
            <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
              {walletAddress.slice(0, 16)}...
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Balance:</strong> {walletData.balance || 0} ADA</Typography>
              <Typography variant="body2">UTXOs: {walletData.utxoCount || 0}</Typography>
              {walletData.hasTokens && (
                <Typography variant="body2" color="success.main">Has native tokens ✓</Typography>
              )}
              {walletData.delegation && (
                <Box sx={{ mt: 1, p: 1, bgcolor: walletData.delegation.isStaking ? '#e8f5e8' : '#fff3e0', borderRadius: 1 }}>
                  <Typography variant="caption" display="block">
                    <strong>Staking:</strong> {walletData.delegation.isStaking ? '✅ Active' : '❌ Not staking'}
                  </Typography>
                  {walletData.delegation.poolId && (
                    <Typography variant="caption" display="block">
                      Pool: {walletData.delegation.poolId.slice(0, 12)}...
                    </Typography>
                  )}
                  {walletData.delegation.rewards > 0 && (
                    <Typography variant="caption" display="block" color="success.main">
                      Rewards: {walletData.delegation.rewards} ADA
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Network Stats */}
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>🌐 Network</Typography>
            <Chip
              label={networkData?.networkStatus || 'Loading...'}
              size="small"
              color="success"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" display="block">
              Blocks: {networkData?.blocks || 0}
            </Typography>
            <Typography variant="caption" display="block">
              Active pools: {networkData?.activePools || 0}
            </Typography>
            <Typography variant="caption" display="block">
              24h txs: {networkData?.txs24h || 0}
            </Typography>
            <Typography variant="caption" display="block" color="success.main">
              ✅ Preview Testnet
            </Typography>
          </Box>

          {/* Pool Recommendations */}
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>🎯 Suggested Pools</Typography>
          {recommendedPools && recommendedPools.length > 0 ? (
            recommendedPools.slice(0, 4).map((pool, i) => (
              <Box key={i} sx={{ 
                mb: 1.5, 
                p: 1, 
                bgcolor: pool.status === 'oversaturated' ? '#ffebee' : 
                         pool.status === 'warning' ? '#fff3e0' : '#f0f8ff', 
                borderRadius: 1,
                border: pool.warning ? '1px solid #ff9800' : 'none'
              }}>
                <Typography variant="caption" display="block">
                  {pool.id?.slice(0, 14) || 'pool'}...
                </Typography>
                <Typography variant="body2">
                  {pool.saturation}% sat - {pool.roa}% ROA - {pool.margin}% fee
                </Typography>
                {pool.warning && (
                  <Typography variant="caption" color="warning.main" display="block">
                    ⚠️ {pool.warning}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="caption">Ask a question to load pool suggestions.</Typography>
          )}

          {/* Audit Trail */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>📝 Audit Trail</Typography>
          {lastProof ? (
            <Box sx={{ fontSize: '0.75rem' }}>
              <Typography variant="caption" display="block">
                Last proof hash:
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                {lastProof}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Masumi log ID:
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                {lastMasumiLog}
              </Typography>
              {premiumMode && (
                <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                  Last answer was requested as PREMIUM (demo).
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption">
              Ask something to generate an auditable answer.
            </Typography>
          )}
          </Box>
        </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}

export default App;
