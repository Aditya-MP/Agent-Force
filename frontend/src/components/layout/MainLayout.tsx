// @ts-nocheck
import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardView from '../views/DashboardView';
import CopilotView from '../views/CopilotView';
import AuditView from '../views/AuditView';
import StakingView from '../views/StakingView';
import AdminAnalytics from '../AdminAnalytics';

interface MainLayoutProps {
  walletAddress: string;
  walletData: any;
  networkData: any;
  recommendedPools: any;
  messages: any[];
  input: string;
  setInput: (input: string) => void;
  sendMessage: () => void;
  loading: boolean;
  typing: boolean;
  txId: string;
  diagnoseTx?: () => void;
  txLoading?: boolean;
  connectionStatus?: string;
  selectedPool?: any;
  setSelectedPool?: any;
  handleNewChat?: () => void;
}

export default function MainLayout(props: MainLayoutProps) {
  const [activeNav, setActiveNav] = useState('command_center');

  return (
    <div className="w-full h-screen bg-[#0a0c10] flex overflow-hidden font-sans selection:bg-[#00f3ff]/30">
      
      {/* LIGHT SIDEBAR (Navigation) */}
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        connectionStatus={props.connectionStatus} 
        handleNewChat={props.handleNewChat}
      />

      {/* DARK MAIN AREA (Right) */}
      <div className="flex-1 bg-[#0a0c10] flex flex-col overflow-hidden relative z-10">
          
          {activeNav === 'command_center' && (
            <DashboardView 
              walletData={props.walletData} 
              networkData={props.networkData} 
              recommendedPools={props.recommendedPools} 
              selectedPool={props.selectedPool}
              setSelectedPool={props.setSelectedPool}
            />
          )}

          {activeNav === 'copilot' && (
             <CopilotView 
                messages={props.messages}
                input={props.input}
                setInput={props.setInput}
                sendMessage={props.sendMessage}
                loading={props.loading}
                typing={props.typing}
                handleNewChat={props.handleNewChat}
             />
          )}

          {activeNav === 'audit' && (
             <AuditView 
                txId={props.txId} 
                diagnoseTx={props.diagnoseTx} 
                txLoading={props.txLoading} 
             />
          )}

          {activeNav === 'staking' && (
             <StakingView 
                recommendedPools={props.recommendedPools} 
                selectedPool={props.selectedPool}
                setSelectedPool={props.setSelectedPool}
             />
          )}
          {activeNav === 'roles' && <AdminAnalytics />}
          
      </div>
      
      {/* Global Scrollbar Styles */}
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #00f3ff; }
      `}</style>
    </div>
  );
}
