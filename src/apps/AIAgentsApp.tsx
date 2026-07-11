import React from 'react';
import { UserCheck, RefreshCw } from 'lucide-react';

import { mockAgents } from '../data/mockData';

export const AIAgentsApp: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#f1efe7] font-sans text-xs select-none">
      {/* Search Header */}
      <div className="bg-[#ece9d8] border-b border-[#a0a0a0] p-2 flex items-center justify-between text-[#000]">
        <div className="font-bold flex items-center gap-1.5 text-gray-800">
          <UserCheck size={16} className="text-[#0054e3]" />
          <span>Active Agent Directory</span>
        </div>
        <button
          onClick={() => alert('Re-scanning agent mesh network...')}
          className="xp-btn px-2.5 py-0.5 flex items-center gap-1 font-semibold text-[10px]"
        >
          <RefreshCw size={10} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Grid of Agents */}
      <div className="flex-1 p-3 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className="border-2 border-[#a0a0a0] rounded-md bg-[#ece9d8] flex flex-col p-3 shadow-sm hover:border-[#3f8cf3] transition"
          >
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-[#a0a0a0] pb-2 mb-2">
              <div>
                <h3 className="font-bold text-sm text-[#002d96]">{agent.name}</h3>
                <p className="text-[10px] text-gray-500 font-mono">Owner: {agent.owner}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-sm ${
                  agent.verification === 'Gold Partner'
                    ? 'bg-gradient-to-r from-[#ffd700] to-[#daa520] border border-[#b8860b] text-black font-extrabold'
                    : 'bg-[#30a030]'
                }`}
              >
                {agent.verification}
              </span>
            </div>

            {/* Core details */}
            <div className="flex-1 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px]">
              <div>
                <span className="text-gray-500 font-semibold block">Role:</span>
                <span className="font-bold text-[#000]">{agent.role}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block">Trust Score:</span>
                <span className="font-bold text-[#008000]">{agent.trustScore}%</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block">Completed Trades:</span>
                <span className="font-bold text-[#000]">{agent.completedTransactions}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block">Success Rate:</span>
                <span className="font-bold text-[#008000]">{agent.successRate}%</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block">Negotiation Skill:</span>
                <span className="font-bold text-[#c00]">{agent.negotiationSkill}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block">Response Time:</span>
                <span className="font-bold text-[#000]">{agent.responseTime}</span>
              </div>
            </div>

            {/* Capabilities */}
            <div className="mt-2.5 pt-2 border-t border-[#a0a0a0]">
              <span className="text-gray-500 font-semibold text-[9px] block mb-1">Capabilities:</span>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="bg-white px-1.5 py-0.5 rounded border border-gray-300 text-[8px] text-gray-700 whitespace-nowrap"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Status indicator bar */}
            <div className="mt-3 pt-1.5 border-t border-[#c0c0c0] flex items-center justify-between text-[9px]">
              <span className="font-semibold text-gray-600">Preferred Category:</span>
              <span className="font-bold truncate max-w-[120px]">{agent.preferredCategories.join(', ')}</span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[9px]">
              <span className="font-semibold text-gray-600">Memory Engine:</span>
              <span className="font-mono text-gray-500">{agent.memory}</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  agent.status === 'Idle' ? 'bg-[#30a030]' : 'bg-[#e0a35b]'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  agent.status === 'Idle' ? 'bg-[#30a030]' : 'bg-[#e0a35b]'
                }`}></span>
              </span>
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[9px]">
                Status: {agent.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
