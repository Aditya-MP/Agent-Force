// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';

import * as echarts from 'echarts';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
  walletData: any;
  networkData: any;
  recommendedPools: any;
  selectedPool?: any;
  setSelectedPool?: any;
}

export default function DashboardView({ walletData, networkData, recommendedPools, selectedPool, setSelectedPool }: DashboardViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    
    let volData = [];
    let loadData = [];
    let dates = [];

    if (networkData?.historical && networkData.historical.length > 0) {
        networkData.historical.forEach((pt: any) => {
            volData.push(pt.volatility);
            loadData.push(pt.txLoad);
            dates.push(pt.time);
        });
    } else {
        // Fallback or waiting for backend
        let baseVol = 0.45;
        let baseLoad = 0.60;
        for(let i=0; i<60; i++) {
            baseVol = baseVol + (Math.random() - 0.48) * 0.05;
            baseLoad = baseLoad + (Math.random() - 0.45) * 0.06;
            volData.push(baseVol.toFixed(4));
            loadData.push(baseLoad.toFixed(4));
            dates.push(`-${60-i}m`);
        }
    }

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(10, 12, 16, 0.9)',
        borderColor: 'rgba(0, 243, 255, 0.3)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function (params: any) {
            let html = `<div style="font-weight:bold;font-size:12px;margin-bottom:4px;color:#9ca3af">Timestamp: ${params[0] ? params[0].name : ''}</div>`;
            if (params[0]) html += `<span style="color:#00f3ff">●</span> ADA Transfer Vol: <span style="font-weight:bold;color:#fff">${params[0].value} ₳</span><br/>`;
            if (params[1]) html += `<span style="color:#ff7300">●</span> Network TX Load: <span style="font-weight:bold;color:#fff">${params[1].value} ₳</span>`;
            return html;
        }
      },
      grid: { top: 20, bottom: 20, left: 50, right: 20 },
      xAxis: { 
          type: 'category', data: dates, show: true,
          axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLabel: { color: '#6c7b91', fontSize: 10 }
      },
      yAxis: { 
          type: 'value', scale: true, show: true,
          splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLabel: { color: '#6c7b91', fontSize: 10, formatter: '{value} ₳' }
      },
      series: [{
          data: volData, type: 'line', smooth: 0.3, symbol: 'none',
          lineStyle: { color: '#00f3ff', width: 2 },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 243, 255, 0.4)' }, 
              { offset: 1, color: 'rgba(0, 243, 255, 0)' }
            ]) 
          }
      },
      {
          data: loadData, type: 'line', smooth: 0.5, symbol: 'none',
          lineStyle: { color: '#ff7300', width: 2 },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 115, 0, 0.2)' }, 
              { offset: 1, color: 'rgba(255, 115, 0, 0)' }
            ]) 
          }
      }]
    });

    let gauge: any;
    if (gaugeRef.current) {
      gauge = echarts.init(gaugeRef.current);
      gauge.setOption({
        backgroundColor: 'transparent',
        series: [{
           type: 'gauge', startAngle: 220, endAngle: -40, min: 0, max: 100, radius: '90%',
           axisLine: { lineStyle: { width: 12, color: [[0.7, '#00f3ff'], [1, '#ff7300']] } },
           pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
           detail: { formatter: 'ADA\nSYNC', color: '#fff', fontSize: 16, offsetCenter: [0, 0] },
           data: [{ value: 76 }]
        }]
      });
    }

    const handleResize = () => { chart.resize(); if (gauge) gauge.resize(); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); if (gauge) gauge.dispose(); };
  }, [networkData]);

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar-dark flex flex-col">
        {/* Top Header Row within dark area */}
        <div className="flex justify-between items-center mb-6 pl-2 border-b border-[#ffffff0a] pb-4">
            <div className="flex space-x-6 text-[10px] uppercase font-bold tracking-widest text-[#6c7b91]">
                <span className="text-white border-b-2 border-[#00f3ff] pb-1 cursor-pointer drop-shadow-[0_0_8px_#00f3ff]">Live Metrics</span>
                <span className="hover:text-white cursor-pointer transition-colors pt-[2px]">Network Topology</span>
            </div>
        </div>

        {/* TOP HALF: Big Chart & 4 Stat Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[280px] mb-6 min-h-[280px]">
            {/* HUGE CHART */}
            <div className="xl:col-span-8 bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,243,255,0.05)] rounded-3xl p-6 relative overflow-hidden flex flex-col group hover:shadow-[0_10px_30px_rgba(0,243,255,0.15)] transition-all">
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-10 blur-sm group-hover:opacity-20 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-[350px] h-[350px] text-[#00f3ff] translate-x-1/4 translate-y-1/4">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                </div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <div className="text-[10px] text-[#6c7b91] uppercase font-bold tracking-widest">Global Telemetry</div>
                    <div className="text-xl text-white font-bold mt-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">ADA Volatility Matrix</div>
                </div>
                <div className="text-[10px] bg-[#00f3ff]/10 text-[#00f3ff] px-3 py-1 rounded shadow-[0_0_10px_rgba(0,243,255,0.2)] font-bold border border-[#00f3ff]/30">LIVE</div>
                </div>
                <div className="flex-1 w-full relative z-10" ref={chartRef}></div>
            </div>

            {/* 4 STAT CARDS */}
            <div className="xl:col-span-4 grid grid-cols-2 grid-rows-2 gap-4">
                <div className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,243,255,0.05)] p-5 rounded-[24px] flex flex-col justify-center relative overflow-hidden group hover:border-[#00f3ff]/50 transition-all">
                    <div className="text-[9px] text-[#6c7b91] uppercase font-bold tracking-widest mb-1 flex justify-between">Total Balance <span className="text-green-400 drop-shadow-[0_0_5px_#4ade80]">+1.2%</span></div>
                    <div className="text-2xl text-white font-bold flex items-end gap-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{walletData?.balance?.toLocaleString() || '0.00'}<span className="text-[10px] text-[#00f3ff] mb-[2px] font-bold drop-shadow-[0_0_5px_#00f3ff]">ADA</span></div>
                </div>
                <div className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#ff7300]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(255,115,0,0.05)] p-5 rounded-[24px] flex flex-col justify-center relative overflow-hidden group hover:border-[#ff7300]/50 transition-all">
                    <div className="text-[9px] text-[#6c7b91] uppercase font-bold tracking-widest mb-1 flex justify-between">Synced Blocks <span className="text-green-400 drop-shadow-[0_0_5px_#4ade80]">+420</span></div>
                    <div className="text-2xl text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{networkData?.blocks || '---'}</div>
                </div>
                <div className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#bc13fe]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(188,19,254,0.05)] p-5 rounded-[24px] flex flex-col justify-center relative overflow-hidden group hover:border-[#bc13fe]/50 transition-all">
                    <div className="text-[9px] text-[#6c7b91] uppercase font-bold tracking-widest mb-1 flex justify-between">Active UTXOs <span className="text-green-400 drop-shadow-[0_0_5px_#4ade80]">+2</span></div>
                    <div className="text-2xl text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{walletData?.utxoCount || '0'}</div>
                </div>
                <div className="bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,243,255,0.05)] p-5 rounded-[24px] flex flex-col justify-center relative overflow-hidden group hover:border-[#00f3ff]/50 transition-all">
                    <div className="text-[9px] text-[#6c7b91] uppercase font-bold tracking-widest mb-1 flex justify-between">Active Pools <span className="text-green-400 drop-shadow-[0_0_5px_#4ade80]">+124</span></div>
                    <div className="text-2xl text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{networkData?.activePools || '---'}</div>
                </div>
            </div>
        </div>

        {/* BOTTOM HALF */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-[300px]">
            {/* Gauge / Performance */}
            <div className="xl:col-span-4 bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,243,255,0.05)] p-6 rounded-3xl flex flex-col shadow-lg">
                <div className="text-[10px] text-[#6c7b91] uppercase font-bold tracking-widest mb-6">Network Health</div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center"><div className="w-[120px] h-[120px]" ref={gaugeRef}></div></div>
                <div className="flex flex-col justify-center gap-4">
                    <div>
                        <div className="text-[10px] text-gray-500 mb-1">Security</div>
                        <div className="w-full h-1 bg-[#1a1e27] rounded"><div className="w-[90%] h-full bg-[#00f3ff] rounded shadow-[0_0_10px_#00f3ff]"></div></div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 mb-1">Throughput</div>
                        <div className="w-full h-1 bg-[#1a1e27] rounded"><div className="w-[40%] h-full bg-[#ff7300] rounded shadow-[0_0_10px_#ff7300]"></div></div>
                    </div>
                </div>
                </div>
            </div>
            
            {/* AI Insight bottom panel */}
            <div className="xl:col-span-4 bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,243,255,0.05)] p-6 rounded-3xl flex flex-col shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00f3ff]/5 animate-pulse pointer-events-none" />
                <div className="text-[10px] text-[#00f3ff] uppercase font-bold tracking-widest mb-4 flex items-center gap-2 drop-shadow-[0_0_5px_#00f3ff] relative z-10">
                    <Grid className="w-4 h-4" /> Agent Insight
                </div>
                <div className="flex-1 flex flex-col justify-center relative z-10">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Network traffic is <span className="text-[#00f3ff] font-bold">highly optimal</span>. Volatility matrix shows a stable <span className="text-green-400 font-bold drop-shadow-[0_0_5px_#4ade80]">+2.4%</span> 24h trend. Consider delegating idle UTXOs to lower-saturation pools to maximize your Epoch rewards and maintain network decentralization.
                    </p>
                </div>
            </div>

            {/* Staking Pools */}
            <div className="xl:col-span-4 bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,243,255,0.05)] p-6 rounded-3xl flex flex-col shadow-lg">
                <div className="text-[10px] text-[#6c7b91] uppercase font-bold tracking-widest mb-4">Top Epoch Pools</div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar-dark pr-2">
                {recommendedPools && recommendedPools.length > 0 ? (
                    recommendedPools.slice(0,4).map((pool: any, i: number) => (
                        <div key={i} onClick={() => setSelectedPool && setSelectedPool(pool)} className="flex justify-between items-center py-2 border-b border-[#ffffff0a] hover:bg-white/5 p-2 rounded transition-colors cursor-pointer">
                        <div><div className="text-xs text-white font-bold">{pool.id.substring(0, 8)}...</div><div className="text-[9px] text-[#6c7b91] uppercase">Vol: {pool.blocks_minted || 0}</div></div>
                        <div className="text-right"><div className="text-xs text-[#00f3ff] font-bold">{pool.roa}%</div><div className="text-[9px] text-[#ff7300] uppercase">Mgn: {pool.margin}%</div></div>
                        </div>
                    ))
                ) : (
                    <div className="text-[10px] text-gray-500 mt-10 text-center">Scan required to load pools...</div>
                )}
                </div>
            </div>
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
                  onClick={() => setSelectedPool && setSelectedPool(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Grid className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Est. ROA</div>
                    <div className="text-2xl font-bold text-green-400">{selectedPool.roa}%</div>
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
                  className="w-full py-3 bg-[#00f3ff] hover:bg-white text-black font-bold rounded-xl transition-all"
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
