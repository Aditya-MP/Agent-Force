// @ts-nocheck

import * as echarts from 'echarts';
import { Layers, Zap, Activity, CheckCircle, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';

interface Pool {
  id: string;
  status: 'excellent' | 'good' | 'warning' | 'oversaturated' | 'new/low' | 'simulated';
  saturation: number;
  roa: string | number;
  margin: string | number;
  fixed_cost?: number;
  blocks_minted?: number;
  warning?: string | null;
  guardianScore?: string;
}

interface StakingViewProps {
  recommendedPools?: Pool[];
  selectedPool?: Pool | null;
  setSelectedPool?: (pool: Pool | null) => void;
}

export default function StakingView({ recommendedPools = [], selectedPool, setSelectedPool }: StakingViewProps) {
    const [activePool, setActivePool] = useState<Pool | null>(null);
    const [poolHistory, setPoolHistory] = useState<{epoch: number, blocks: number}[] | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Fetch live history whenever pool changes
    useEffect(() => {
        if (!activePool) return;
        setHistoryLoading(true);
        fetch(`/api/pool-history/${activePool.id}`)
            .then(res => res.json())
            .then(data => {
                setPoolHistory(data);
                setHistoryLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch pool history", err);
                setHistoryLoading(false);
            });
    }, [activePool]);

    // Sync external selected pool or default to first
    useEffect(() => {
        if (selectedPool) setActivePool(selectedPool);
        else if (recommendedPools.length > 0 && !activePool) setActivePool(recommendedPools[0]);
    }, [selectedPool, recommendedPools]);

    const handleSelect = (p: Pool) => {
        setActivePool(p);
        if (setSelectedPool) setSelectedPool(p);
    };

    const satRef = useRef<HTMLDivElement>(null);
    const histRef = useRef<HTMLDivElement>(null);

    // Render Charts
    useEffect(() => {
        if (!activePool || !satRef.current || !histRef.current) return;

        const satChart = echarts.init(satRef.current);
        const histChart = echarts.init(histRef.current);

        // Dynamic theme color based on saturation
        const satValue = activePool.saturation;
        const color = satValue > 90 ? '#ef4444' : satValue > 75 ? '#ff7300' : '#00f3ff';
        
        // Saturation Gauge
        satChart.setOption({
            backgroundColor: 'transparent',
            series: [{
                type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100,
                splitNumber: 10, radius: '100%', center: ['50%', '75%'],
                axisLine: {
                    lineStyle: {
                        width: 15,
                        color: [
                            [0.75, '#00f3ff'],
                            [0.90, '#ff7300'],
                            [1, '#ef4444']
                        ]
                    }
                },
                pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '60%', width: 8, offsetCenter: [0, '-10%'], itemStyle: { color: '#ffffff' } },
                axisTick: { length: 12, lineStyle: { color: 'auto', width: 1 } },
                splitLine: { length: 20, lineStyle: { color: 'auto', width: 2 } },
                axisLabel: { color: '#6c7b91', distance: -35, fontSize: 10, formatter: '{value}%' },
                title: { offsetCenter: [0, '-20%'], fontSize: 10 },
                detail: {
                    fontSize: 24, offsetCenter: [0, '20%'], valueAnimation: true,
                    formatter: '{value}%', color: '#fff', fontWeight: 'bold'
                },
                data: [{ value: satValue, name: '' }]
            }]
        });

        // Live Historical Performance (Blocks)
        let histBlocks: number[] = [];
        let epochLabels: string[] = [];
        
        if (poolHistory && poolHistory.length > 0) {
            poolHistory.forEach(h => {
                histBlocks.push(h.blocks);
                epochLabels.push(`Ep ${h.epoch}`);
            });
        }

        if (historyLoading) {
            histChart.showLoading({
                text: 'SYNCING BLOCKCHAIN...',
                color: '#00f3ff',
                textColor: '#00f3ff',
                maskColor: 'rgba(10,12,16,0.8)',
                fontSize: 10,
                // @ts-ignore
                spinnerRadius: 10,
                lineWidth: 2
            });
        } else {
            histChart.hideLoading();
        }

        histChart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,12,16,0.9)', borderColor: color, textStyle: { color: '#fff' } },
            grid: { top: 20, bottom: 20, left: 30, right: 10 },
            xAxis: { type: 'category', data: epochLabels, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#6c7b91', fontSize: 9 } },
            yAxis: { type: 'value', splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { show: false } },
            series: [{
                data: histBlocks, type: 'bar', barWidth: '40%',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: color }, { offset: 1, color: 'transparent' }]),
                    borderRadius: [4, 4, 0, 0]
                }
            }]
        });

        const handleResize = () => { satChart.resize(); histChart.resize(); };
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); satChart.dispose(); histChart.dispose(); };
    }, [activePool, poolHistory, historyLoading]);

    // AI Insight Generator
    const getAiInsight = (pool: Pool) => {
        if (Number(pool.saturation) > 90) return { title: 'CRITICAL WARNING', text: 'This pool is oversaturated. Your rewards will be heavily penalized. Immediate redelegation recommended.', color: 'text-red-400', border: 'border-red-500/50', icon: <AlertTriangle className="w-5 h-5 text-red-500"/> };
        if (Number(pool.saturation) > 80) return { title: 'SATURATION ALERT', text: 'This pool is approaching capacity. Monitor closely as rewards may soon decrease.', color: 'text-[#ff7300]', border: 'border-[#ff7300]/50', icon: <AlertTriangle className="w-5 h-5 text-[#ff7300]"/> };
        if (pool.margin > 4) return { title: 'HIGH FEES DETECTED', text: `This operator charges a high margin fee (${pool.margin}%). Though performance is stable, you might find better yields elsewhere.`, color: 'text-yellow-400', border: 'border-yellow-400/50', icon: <Activity className="w-5 h-5 text-yellow-400"/> };
        return { title: 'OPTIMAL SELECTION', text: 'This pool demonstrates strong historical stability, healthy saturation limits, and competitive fees. A safe choice for long-term delegation.', color: 'text-[#00f3ff]', border: 'border-[#00f3ff]/50', icon: <CheckCircle className="w-5 h-5 text-[#00f3ff]"/> };
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-[#0a0c10]">
            
            {/* LEFT: Pool Directory */}
            <div className="w-1/3 xl:w-1/4 flex flex-col border-r border-[#ffffff0a] bg-[#0d1017]">
                <div className="p-6 border-b border-[#ffffff0a]">
                    <div className="flex items-center gap-3">
                        <Layers className="w-6 h-6 text-[#ff0000] drop-shadow-[0_0_12px_#ff0000]" />
                        <h2 className="text-white font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_5px_rgba(255,0,0,0.3)]">Operation Pools</h2>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 space-y-3">
                    {recommendedPools.length > 0 ? recommendedPools.map(pool => (
                        <div 
                            key={pool.id} 
                            onClick={() => handleSelect(pool)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border duration-300 ${activePool?.id === pool.id ? 'bg-[#ff0000]/15 border-[#ff0000] shadow-[0_0_25px_rgba(255,0,0,0.3)]' : 'bg-[#1b2230]/50 border-transparent hover:bg-[#ff0000]/5 hover:border-[#ff0000]/30 hover:shadow-[0_0_15px_rgba(255,0,0,0.1)]'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${Number(pool.saturation) > 80 ? 'bg-orange-500/20 text-orange-400' : 'bg-[#ff0000]/20 text-[#ff0000]'}`}>
                                    {Number(pool.saturation) > 80 ? 'HIGH SAT' : 'HEALTHY'}
                                </span>
                                <span className={`${activePool?.id === pool.id ? 'text-[#ff0000]/80' : 'text-gray-500'} text-[10px] font-mono text-right transition-colors`}>{pool.id.substring(0,6)}...</span>
                            </div>
                            <div className="text-white font-bold text-lg mb-1">{pool.roa}% <span className="text-xs text-gray-500 font-normal">ROA</span></div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Sat: {pool.saturation}%</span>
                                <span>Fee: {pool.margin}%</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 text-xs py-10 mt-10">NO POOLS FOUND.<br/>AWAITING SYNC...</div>
                    )}
                </div>
            </div>

            {/* RIGHT: Selected Pool Analytics */}
            <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar-dark relative">
                {/* Background glow based on health */}
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-[#00f3ff]/5 rounded-full blur-[120px] pointer-events-none" />

                {activePool ? (
                    <div className="max-w-5xl mx-auto w-full space-y-6 relative z-10">
                        
                        {/* Header Area */}
                        <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-6">
                            <div>
                                <div className="text-[#6c7b91] text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-[#00f3ff]"/> DELEGATION TARGET
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] break-all">
                                    {activePool.id}
                                </h1>
                            </div>
                            <button 
                                onClick={() => window.open(`https://preview.cardanoscan.io/pool/${activePool.id}`, '_blank')}
                                className="bg-[#00f3ff] hover:bg-white text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                            >
                                View on Explorer
                            </button>
                        </div>

                        {/* AI Insight Bar */}
                        <div className={`w-full bg-gradient-to-r from-black/40 to-transparent border-l-4 ${getAiInsight(activePool).border} p-5 rounded-r-2xl flex items-start gap-4 shadow-lg`}>
                            <div className={`p-2 bg-black/40 rounded-full shadow-inner ${getAiInsight(activePool).border} border`}>
                                {getAiInsight(activePool).icon}
                            </div>
                            <div>
                                <h4 className={`${getAiInsight(activePool).color} text-[10px] font-bold uppercase tracking-widest drop-shadow-[0_0_5px_currentColor] mb-1`}>
                                    Agent Assessment: {getAiInsight(activePool).title}
                                </h4>
                                <p className="text-gray-300 text-sm">{getAiInsight(activePool).text}</p>
                            </div>
                        </div>

                        {/* Macro Stats Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'EXPECTED ROA', value: `${activePool.roa}%`, color: 'text-[#00f3ff]' },
                                { label: 'MARGIN FEE', value: `${activePool.margin}%`, color: 'text-white' },
                                { label: 'FIXED COST', value: `${activePool.fixed_cost || 340} ₳`, color: 'text-white' },
                                { label: 'LIFETIME BLOCKS', value: activePool.blocks_minted || '0', color: 'text-[#ff7300]' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-white/5 rounded-2xl p-5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)]">
                                    <div className="text-[9px] text-[#6c7b91] uppercase font-bold tracking-widest mb-2">{stat.label}</div>
                                    <div className={`text-2xl font-bold ${stat.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-2 gap-6 h-[250px]">
                            {/* Gauge Chart */}
                            <div className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 blur-sm group-hover:opacity-10 transition-opacity">
                                    <Zap className="w-[200px] h-[200px] text-[#00f3ff] translate-x-1/4 translate-y-1/4" />
                                </div>
                                <div className="text-[10px] text-[#00f3ff] uppercase font-bold tracking-widest mb-1 relative z-10 drop-shadow-[0_0_5px_#00f3ff]">Saturation Risk Level</div>
                                <div className="h-full w-full relative z-10" ref={satRef}></div>
                            </div>

                            {/* Bar Chart */}
                            <div className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/10 rounded-3xl p-5 shadow-xl flex flex-col relative overflow-hidden">
                                <div className="text-[10px] text-[#6c7b91] uppercase font-bold tracking-widest mb-1 flex justify-between relative z-10">
                                    <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-[#00f3ff]" /> Performance History</span>
                                    <span className="text-[#00f3ff] bg-[#00f3ff]/10 px-2 py-0.5 rounded border border-[#00f3ff]/20">10 EPOCHS</span>
                                </div>
                                <div className="flex-1 w-full relative z-10" ref={histRef}></div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <Activity className="w-12 h-12 mb-4 opacity-50" />
                        <div className="text-xs tracking-widest uppercase font-bold text-center">No pool selected.<br/>Select a target from the directory.</div>
                    </div>
                )}

            </div>
        </div>
    );
}
