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
    <div className="flex-1 overflow-auto p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-white mb-8 flex items-center gap-3">
          <Activity className="w-8 h-8 text-neon-cyan" />
          Live Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className={`group p-6 rounded-2xl border ${metric.border} ${metric.bg} backdrop-blur-sm transition-all hover:transform hover:-translate-y-1 hover:shadow-lg`}
            >
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

        <div className="p-6 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-neon-cyan mb-6 flex items-center gap-2">
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
              <div key={i} className="flex-1 min-w-[140px] p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex justify-between items-center mb-3 text-xs uppercase tracking-wider text-gray-500 font-bold">
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
