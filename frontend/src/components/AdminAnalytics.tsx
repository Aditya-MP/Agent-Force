import React, { useState, useEffect } from 'react';
import { BarChart, Activity, PieChart, Info, HelpCircle } from 'lucide-react';

async function fetchAnalytics() {
  const res = await fetch(`/api/admin/analytics`);
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-gray-400">Loading analytics...</div>;

  const { totalQueries, balance, staking, txHelp, other } = data;
  const pct = (x: number) => totalQueries ? ((x / totalQueries) * 100).toFixed(1) + '%' : '0%';

  const metrics = [
    { label: 'Total Queries', value: totalQueries, color: 'text-neon-cyan', border: 'border-neon-cyan/20', bg: 'bg-neon-cyan/10', icon: BarChart },
    { label: 'Balance Questions', value: `${balance} (${pct(balance)})`, color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/10', icon: PieChart },
    { label: 'Staking/Pool Questions', value: `${staking} (${pct(staking)})`, color: 'text-neon-purple', border: 'border-neon-purple/20', bg: 'bg-neon-purple/10', icon: Activity },
    { label: 'Transaction Help', value: `${txHelp} (${pct(txHelp)})`, color: 'text-neon-cyan', border: 'border-neon-cyan/20', bg: 'bg-neon-cyan/10', icon: Info },
    { label: 'Other Questions', value: `${other} (${pct(other)})`, color: 'text-pink-400', border: 'border-pink-400/20', bg: 'bg-pink-400/10', icon: HelpCircle }
  ];

  return (
    <div className="flex-1 overflow-auto p-8 relative bg-transparent">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00f3ff]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-white mb-8 flex items-center gap-3">
          <Activity className="w-8 h-8 text-neon-cyan" />
          Live Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className={`group p-6 rounded-[24px] bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,243,255,0.05)] backdrop-blur-sm transition-all hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,243,255,0.2)] hover:border-[#00f3ff]/50 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#00f3ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-8 h-8 ${metric.color} opacity-80 group-hover:scale-110 transition-transform`} />
              </div>
              <div className={`text-3xl font-bold ${metric.color} mb-1 tracking-tight`}>
                {metric.value}
              </div>
              <div className="text-sm text-gray-400 font-medium">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-[24px] bg-gradient-to-br from-[#1b2230] to-[#111620] border border-[#00f3ff]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,243,255,0.05)] backdrop-blur-sm relative overflow-hidden">
          <h3 className="text-xl font-bold text-white drop-shadow-[0_0_8px_#00f3ff] mb-8 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Query Distribution
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Balance', value: balance, color: 'bg-red-400', text: 'text-red-400' },
              { label: 'Staking', value: staking, color: 'bg-neon-purple', text: 'text-neon-purple' },
              { label: 'Tx Help', value: txHelp, color: 'bg-neon-cyan', text: 'text-neon-cyan' },
              { label: 'Other', value: other, color: 'bg-pink-400', text: 'text-pink-400' }
            ].map((item, i) => (
              <div key={i} className="flex-1 min-w-[140px] p-5 rounded-[20px] bg-[#0a0c10] border border-[#00f3ff]/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative z-10 transition-transform hover:scale-105">
                <div className="flex justify-between items-center mb-3 text-[10px] uppercase tracking-widest text-[#6c7b91] font-bold">
                  {item.label}
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${totalQueries ? (item.value / totalQueries) * 100 : 0}%` }}
                  />
                </div>
                <div className={`text-xl font-mono font-bold ${item.text}`}>
                  {item.value} <span className="text-gray-600 text-xs font-normal">queries</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
