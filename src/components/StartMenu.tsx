import React from 'react';
import { ShoppingCart, MessageSquare, Shield, HelpCircle, Users, Activity, Settings, Newspaper, LogOut, Power, FolderOpen, Heart, FileText } from 'lucide-react';
import type { AppId } from '../types/os';
import type { UserProfile } from './LoginScreen';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
  currentUser: UserProfile | null;
  onLogoff: () => void;
  onShutdown: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose, onOpenApp, currentUser, onLogoff, onShutdown }) => {
  if (!isOpen) return null;

  const handleProgramClick = (appId: AppId) => {
    onOpenApp(appId);
    onClose();
  };

  const roleColor = currentUser?.role === 'seller' ? '#8b4513' : '#002d96';

  return (
    <div
      className="absolute bottom-[40px] left-0 w-[400px] bg-[#2f71f6] rounded-t-md shadow-2xl border-t border-x border-[#003db3] flex flex-col font-sans select-none"
      style={{ boxShadow: '5px 5px 20px rgba(0,0,0,0.6)', zIndex: 999995 }}
      onClick={e => e.stopPropagation()}
    >
      {/* User Panel Header */}
      <div className="bg-gradient-to-r from-[#0054e3] to-[#3f8cf3] p-3 flex items-center gap-3 border-b border-[#082c7c] text-white">
        <div className="w-12 h-12 rounded border-2 border-white bg-white overflow-hidden flex items-center justify-center text-2xl shadow">
          {currentUser?.avatar || '👤'}
        </div>
        <div className="flex-1">
          <span className="font-bold text-sm block">{currentUser?.name || 'User Account'}</span>
          <span className="text-[10px] text-gray-200">
             {currentUser?.role === 'seller' ? '🏪 Seller Account' : '🛒 Buyer Account'}
             {' · '}
             {currentUser?.role === 'buyer' ? `Balance: ₹${(currentUser.balance || 0).toLocaleString()}` : 'Local Node Connected'}
           </span>
        </div>
        <div className="text-[9px] text-blue-200 font-mono">56k ✓</div>
      </div>

      {/* Two Column Body */}
      <div className="flex bg-white text-xs">
        {/* Left: Programs */}
        <div className="w-3/5 p-2 flex flex-col gap-0.5 bg-white border-r border-[#a0c2e6]">
          <span className="text-[10px] font-bold pl-2 pb-1.5 border-b border-gray-100 uppercase tracking-wide" style={{ color: roleColor }}>
            Frequently Used
          </span>

          {[
            { id: 'marketplace',   icon: <ShoppingCart size={18} className="text-[#0054e3]" />, label: 'Marketplace.exe', sub: 'Browse listings' },
            { id: 'shoppingAgent', icon: <Activity size={18} className="text-[#3cc03c]" />, label: 'ShoppingAgent.exe', sub: 'Autonomous buying loop' },
            { id: 'messenger',     icon: <MessageSquare size={18} className="text-amber-500" />, label: 'Messenger.exe', sub: 'Agent-to-agent negotiations' },
            { id: 'agents',        icon: <Users size={18} className="text-indigo-600" />, label: 'AI Agents.exe', sub: 'Identity certificates' },
            { id: 'trustCenter',   icon: <Shield size={18} className="text-[#30a030]" />, label: 'Trust Center.exe', sub: 'Security diagnostics' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleProgramClick(item.id as AppId)}
              className="flex items-center gap-2.5 p-2 rounded hover:bg-[#3f8cf3] hover:text-white group text-left w-full"
            >
              <span className="group-hover:[&>*]:text-white">{item.icon}</span>
              <div>
                <span className="font-bold block">{item.label}</span>
                <span className="text-[9px] text-gray-500 group-hover:text-gray-200">{item.sub}</span>
              </div>
            </button>
          ))}

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => handleProgramClick('help')}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#3f8cf3] hover:text-white group text-left w-full pl-3"
          >
            <HelpCircle size={14} className="text-gray-500 group-hover:text-white" />
            <span className="font-bold">All Programs ▶</span>
          </button>
        </div>

        {/* Right: System Folders */}
        <div className="w-2/5 bg-[#d6e5f4] p-2 flex flex-col gap-0.5">
          {[
            { id: 'transactions', icon: <FolderOpen size={14} />, label: 'My Registry' },
            { id: 'receipt',      icon: <FileText size={14} />,   label: 'My Receipts' },
            { id: 'analytics',    icon: <Activity size={14} />,   label: 'My Diagnostics' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleProgramClick(item.id as AppId)}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#3f8cf3] hover:text-white group text-left w-full text-[#002d96] group-hover:text-white"
            >
              {item.icon}
              <span className="font-bold">{item.label}</span>
            </button>
          ))}

          <div className="border-t border-[#a0c2e6] my-1" />

          {[
            { id: 'settings', icon: <Settings size={14} />, label: 'Control Panel' },
            { id: 'news',     icon: <Newspaper size={14} />, label: 'Agent News' },
            { id: 'help',     icon: <HelpCircle size={14} />, label: 'Help & Support' },
            { id: 'about',    icon: <Heart size={14} className="text-red-500" />, label: 'About AgentBay' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleProgramClick(item.id as AppId)}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#3f8cf3] hover:text-white group text-left w-full text-[#002d96] group-hover:text-white"
            >
              {item.icon}
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer: Log Off / Shut Down */}
      <div className="bg-[#003db3] p-2 flex justify-end gap-3 text-white border-t border-[#00246b] rounded-b-md">
        <button
          onClick={() => { onClose(); onLogoff(); }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#2f71f6] transition-colors border border-[#1a4fa0]"
        >
          <LogOut size={13} className="text-orange-300" />
          <span>Log Off</span>
        </button>
        <button
          onClick={() => { onClose(); onShutdown(); }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#2f71f6] transition-colors border border-[#1a4fa0]"
        >
          <Power size={13} className="text-red-300" />
          <span>Turn Off Computer</span>
        </button>
      </div>
    </div>
  );
};
