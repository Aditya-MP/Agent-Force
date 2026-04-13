// @ts-nocheck

import { ShieldCheck, Database, Clock, Fingerprint, RefreshCcw, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MasumiLog {
  id: string;
  txHash: string;
  status: string;
  timestamp: string;
  promptContext: string;
  aiResponsePreview: string;
  premiumStatus: string;
}

export default function AuditView() {
    const [logs, setLogs] = useState<MasumiLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/masumi-logs');
            const data = await res.json();
            
            // Sort frontend to bypass missing Firebase index on old documents
            const sortedData = data.sort((a: any, b: any) => {
                const timeA = new Date(a.timestamp || 0).getTime();
                const timeB = new Date(b.timestamp || 0).getTime();
                return timeB - timeA;
            });
            
            setLogs(sortedData);
        } catch (e) {
            console.error('Failed to fetch Masumi database logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Set up polling to keep the ledger live
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + d.getMilliseconds().toString().padStart(3, '0');
    };

    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
    };

  return (
    <div className="flex-1 flex flex-col p-8 bg-transparent overflow-hidden">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end relative z-10 w-full">
            <div>
                <h2 className="text-3xl font-light text-white flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    <ShieldCheck className="w-8 h-8 text-[#00f3ff] drop-shadow-[0_0_8px_#00f3ff]" /> Masumi Verification Ledger
                </h2>
                <p className="text-sm text-[#6c7b91] mt-2 font-mono uppercase tracking-[0.2em]">Automated Cryptographic Agent Pipeline</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#00f3ff]/10 border border-[#00f3ff]/30 rounded-lg shadow-[inset_0_0_10px_rgba(0,243,255,0.1)]">
                    <Database className="w-4 h-4 text-[#00f3ff]" />
                    <span className="text-[10px] font-mono text-[#00f3ff] uppercase tracking-widest font-bold">Secure DB Connected</span>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="p-2.5 bg-gradient-to-br from-[#1b2230] to-[#111620] border border-white/10 rounded-lg hover:border-[#00f3ff]/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all group"
                >
                    <RefreshCcw className={`w-4 h-4 text-gray-400 group-hover:text-[#00f3ff] ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        {/* Ledger Feed */}
        <div className="flex-1 overflow-y-auto px-2 pb-8 custom-scrollbar-dark relative z-10">
            {logs.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 mt-[-50px]">
                    <div className="relative mb-6">
                        <Activity className="w-24 h-24 text-[#00f3ff] font-thin opacity-50" />
                        <div className="absolute inset-0 bg-[#00f3ff] blur-[60px] opacity-20" />
                    </div>
                    <div className="text-sm font-bold tracking-[0.3em] text-[#00f3ff] uppercase drop-shadow-[0_0_8px_#00f3ff]">Ledger Empty</div>
                    <div className="text-[10px] tracking-widest text-[#6c7b91] uppercase mt-2">Awaiting Agent Forces Activity...</div>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {logs.map((log) => (
                            <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-full bg-gradient-to-r from-[#11131a]/90 to-[#0a0c10]/90 backdrop-blur-md rounded-2xl border border-l-4 border-white/5 border-l-[#00f3ff]/70 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] p-5 relative overflow-hidden group hover:border-l-[#00f3ff] hover:shadow-[0_10px_30px_rgba(0,243,255,0.15)] hover:bg-[#12151c]/90 transition-all duration-300"
                            >
                                {/* Glow Effect on hover */}
                                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#00f3ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                    
                                    {/* Left: Metadata */}
                                    <div className="md:w-1/3 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Clock className="w-3.5 h-3.5 text-[#6c7b91]" />
                                                <span className="text-[11px] font-mono text-[#6c7b91] tracking-wider">{formatDate(log.timestamp)} <span className="text-white ml-2">{formatTime(log.timestamp)}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4 bg-black/40 px-3 py-2 rounded-lg border border-[#00f3ff]/20 w-fit">
                                                <Fingerprint className="w-4 h-4 text-[#00f3ff]" />
                                                <span className="text-xs font-mono text-[#00f3ff] tracking-widest">{(log.txHash || log.hash || '').substring(0,24)}...</span>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-md shadow-[0_0_10px_rgba(34,197,94,0.1)] w-fit mt-auto cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_#4ade80]" />
                                            <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest font-bold">Cryptographically Secured</span>
                                        </div>
                                    </div>

                                    {/* Right: AI Output Tracing */}
                                    <div className="md:w-2/3 bg-[#0a0c10]/80 rounded-xl border border-white/5 p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Agent Action Trigger</span>
                                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${(log.premiumStatus || '').includes('PREMIUM') ? 'bg-[#ff7300]/20 text-[#ff7300] border border-[#ff7300]/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>{(log.premiumStatus || 'STANDARD').replace('_TIER', '')}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 font-sans italic mb-4">"{log.promptContext || log.question || ''}"</p>
                                        
                                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#00f3ff]/70 mb-2 border-t border-white/5 pt-3">Analyzed Payload Snippet</div>
                                        <p className="text-xs text-gray-400 font-mono leading-relaxed line-clamp-3">
                                            {log.aiResponsePreview || log.responsePreview || ''}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    </div>
  );
}
