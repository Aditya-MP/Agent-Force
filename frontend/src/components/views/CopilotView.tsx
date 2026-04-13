// @ts-nocheck

import { Terminal, MessageSquare, Loader, Send, Shield, User, Activity, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopilotViewProps {
  messages: any[];
  input: string;
  setInput: (input: string) => void;
  sendMessage: () => void;
  loading: boolean;
  typing: boolean;
  handleNewChat?: () => void;
}

export default function CopilotView({ messages, input, setInput, sendMessage, loading, typing, handleNewChat }: CopilotViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#07090c]">
        {/* Ambient Geometric Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#00f3ff]/5 rounded-full blur-[100px] mix-blend-screen" />
            <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-[#00f3ff]/5 rounded-full blur-[120px] mix-blend-screen" />
            {/* Cyber Grid */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,243,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        </div>

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#00f3ff]/10 bg-[#0c0e14]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-20 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-light text-white flex items-center gap-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                    <MessageSquare className="text-[#00f3ff] drop-shadow-[0_0_8px_#00f3ff]" /> AI Copilot Node
                </h2>
                <p className="text-xs text-[#6c7b91] mt-1 font-mono uppercase tracking-widest">Encrypted On-Chain Intelligence</p>
            </div>
            <div className="flex items-center gap-4">
                {handleNewChat && (
                    <button 
                        onClick={handleNewChat} 
                        className="px-4 py-1.5 bg-[#00f3ff]/10 hover:bg-[#00f3ff] text-[#00f3ff] hover:text-black border border-[#00f3ff]/30 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest shadow-[inset_0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                    >
                        <Plus className="w-4 h-4" /> New Session
                    </button>
                )}
                <div className="px-3 py-1 bg-[#00f3ff]/10 border border-[#00f3ff]/30 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_5px_#00f3ff]" />
                    <span className="text-[9px] text-[#00f3ff] font-bold tracking-widest uppercase">Agent Active</span>
                </div>
            </div>
        </div>
        
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar-dark relative z-10 scroll-smooth">
            {messages.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center opacity-40 mix-blend-screen"
                >
                    <div className="relative">
                        <Terminal className="w-24 h-24 text-[#00f3ff] mb-6 font-thin opacity-50" />
                        <div className="absolute inset-0 bg-[#00f3ff] blur-[50px] opacity-20" />
                    </div>
                    <div className="text-sm font-bold tracking-[0.3em] text-[#00f3ff] uppercase drop-shadow-[0_0_8px_#00f3ff]">Neural Terminal Initialized</div>
                    <div className="text-[10px] tracking-widest text-[#6c7b91] uppercase mt-2">Awaiting Secure Directives</div>
                </motion.div>
            ) : (
                <AnimatePresence>
                    {messages.map((msg: any) => (
                        <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`flex items-end gap-3 w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {!msg.isUser && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#00f3ff]/20 to-transparent translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300" />
                                    <Shield className="w-4 h-4 text-[#00f3ff] drop-shadow-[0_0_5px_#00f3ff]" />
                                </div>
                            )}

                            <div className={`text-[13px] leading-relaxed p-4 max-w-[75%] font-mono backdrop-blur-md relative
                                ${msg.isUser 
                                    ? 'bg-gradient-to-bl from-[#00f3ff]/90 to-[#0088ff]/90 text-black rounded-2xl rounded-br-sm shadow-[0_8px_25px_rgba(0,243,255,0.3),inset_0_2px_4px_rgba(255,255,255,0.8)] font-medium border border-white/20' 
                                    : 'bg-gradient-to-br from-[#121620]/90 to-[#0d1017]/90 text-gray-200 rounded-2xl rounded-bl-sm border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)]'}`}
                            >
                                <div className="relative z-10 whitespace-pre-wrap">{msg.text}</div>
                            </div>

                            {msg.isUser && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f3ff] to-[#0088ff] flex items-center justify-center shadow-lg shadow-[#00f3ff]/30 border border-white/20">
                                    <User className="w-4 h-4 text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
            
            {/* Typing Indicator */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-end gap-3 justify-start"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                            <Activity className="w-4 h-4 text-[#00f3ff] animate-pulse" />
                        </div>
                        <div className="bg-gradient-to-br from-[#121620]/90 to-[#0d1017]/90 rounded-2xl rounded-bl-sm border border-[#00f3ff]/10 p-4 shadow-lg flex items-center gap-1.5 h-[52px]">
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_5px_#00f3ff]" />
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_5px_#00f3ff]" />
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_5px_#00f3ff]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-[#07090c]/90 backdrop-blur-xl border-t border-[#00f3ff]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative z-20">
            <div className="relative max-w-4xl mx-auto group">
                {/* Input Glow Trace */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff]/0 via-[#00f3ff]/20 to-[#00f3ff]/0 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-[10px] transition-opacity duration-500 pointer-events-none" />
                
                <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c7b91] group-focus-within:text-[#00f3ff] transition-colors duration-300" />
                <input
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                    placeholder="Execute secure directive..."
                    className="w-full bg-[#0d1017]/50 border border-[#00f3ff]/10 hover:border-[#00f3ff]/30 rounded-2xl py-4 pl-14 pr-16 text-sm text-white font-mono placeholder:text-[#6c7b91]/50 focus:outline-none focus:border-[#00f3ff] focus:bg-[#11131a] transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                />
                <button 
                    onClick={sendMessage} 
                    disabled={loading || !input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-[#00f3ff] to-[#00a0a0] text-black rounded-[10px] hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center z-10"
                >
                    <Send className="w-4 h-4 ml-0.5" />
                </button>
            </div>
            
            <div className="text-center mt-3 flex items-center justify-center gap-2">
                <Shield className="w-3 h-3 text-[#6c7b91] opacity-50" />
                <p className="text-[9px] text-[#6c7b91] font-mono tracking-widest uppercase opacity-50">Transmissions secured via advanced cryptography</p>
            </div>
        </div>
    </div>
  );
}
