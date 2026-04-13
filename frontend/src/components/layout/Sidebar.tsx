// @ts-nocheck

import { Shield, Grid, MessageSquare, Layers, CheckCircle, User } from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  connectionStatus?: string;
  handleNewChat?: () => void;
}

export default function Sidebar({ activeNav, setActiveNav, connectionStatus, handleNewChat }: SidebarProps) {
  const navItems = [
    { id: 'command_center', label: 'Command Center', icon: Grid },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare },
    { id: 'staking', label: 'Staking Ops', icon: Layers },
    { id: 'audit', label: 'Audit Protocol', icon: CheckCircle },
    { id: 'roles', label: 'Access Roles', icon: User },
  ];

  return (
    <div className="w-[280px] bg-[#fcfcfc] h-full flex-shrink-0 flex flex-col z-20 border-r border-gray-200/50 relative overflow-hidden">
        {/* Subtle top left glow */}
        <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Logo/Header */}
        <div className="p-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                   <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="font-extrabold tracking-[0.2em] text-sm uppercase text-black">Agent Sync</div>
            </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col px-5 mt-4 gap-2 relative z-10">
            <h4 className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-3 pl-3">Standard Operations</h4>
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                <button 
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group outline-none ${isActive ? 'bg-black shadow-[0_8px_25px_rgba(0,0,0,0.15)] translate-x-1' : 'bg-transparent hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)]'}`}
                >
                    {isActive && (
                        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                    )}
                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-[#00f3ff]' : 'text-gray-400 group-hover:text-black group-hover:scale-110'}`} />
                    <span className={`text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'}`}>{item.label}</span>
                </button>
                );
            })}
        </div>

        {/* Bottom User Area */}
        <div className="p-4 m-5 rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center gap-4 relative z-10 overflow-hidden group hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0
                ${connectionStatus === 'connected' ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                AF
            </div>
            <div>
                <div className="text-sm font-bold text-black drop-shadow-sm transition-colors uppercase tracking-widest text-[10px]">Security Module</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-[pulse_2s_ease-in-out_infinite]' : 'bg-red-500'}`} />
                    <div className={`text-[9px] uppercase tracking-widest font-bold ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-500'}`}>
                        {connectionStatus || 'Disconnected'}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
