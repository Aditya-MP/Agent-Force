import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Scan, CheckCircle, Shield, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (walletAddress: string) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enter' | 'verify' | 'success'>('enter');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!walletAddress.trim()) return;

    setLoading(true);
    setError('');

    // Simulate verification delay
    setTimeout(() => {
      if (walletAddress.includes('addr') || walletAddress.length > 20) {
        setStep('verify');
        setTimeout(() => {
          setStep('success');
          setTimeout(() => {
            onLogin(walletAddress);
          }, 1500);
        }, 2000);
      } else {
        setError('Enter a valid Cardano wallet address (starts with addr...)');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cyber-black overflow-hidden relative selection:bg-neon-cyan selection:text-black font-sans">

      {/* Background Animated Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-glass-dark backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Subtle Glow Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8 relative">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center shadow-lg shadow-neon-cyan/20 group"
            >
              <Shield className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-500" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">CardanoVault</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-px w-8 bg-white/20" />
              <p className="text-neon-cyan text-sm font-mono tracking-widest uppercase">Agent Access</p>
              <span className="h-px w-8 bg-white/20" />
            </div>
            <p className="text-gray-400 text-sm">Secure biometric & wallet authentication</p>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {step === 'enter' && (
              <motion.div
                key="enter"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Wallet Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 focus:border-neon-cyan transition-all font-mono text-sm"
                      placeholder="addr_test1q..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-xs ml-1 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {error}
                    </motion.p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !walletAddress.trim()}
                  className="w-full py-4 bg-gradient-to-r from-neon-cyan to-[#00A085] text-black font-bold rounded-xl shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Initialize Session</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center py-8"
              >
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-neon-cyan/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-4 border-neon-cyan/40 rounded-full animate-spin-slow" />
                  <div className="absolute inset-4 bg-neon-cyan/10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Scan className="w-8 h-8 text-neon-cyan animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verifying Credentials</h3>
                <p className="text-gray-400 text-sm">Validating blockchain identity...</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Access Granted</h3>
                <p className="text-green-400/80 text-sm">Redirecting to command center...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">Protected by Masumi Cryptographic Verification</p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
