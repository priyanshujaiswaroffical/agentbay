import React from 'react';

export const AboutApp: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center gap-4 text-xs font-sans select-none bg-[#ece9d8] h-full overflow-y-auto">
      {/* OS Banner */}
      <div className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-[#002080] via-[#0054e3] to-[#002080] text-white rounded border border-[#002d96] shadow-inner">
        <div className="text-center">
          <h1 className="text-xl font-bold italic tracking-wider font-sans">Microsoft Windows</h1>
          <p className="text-[10px] tracking-widest font-semibold uppercase opacity-90">Agent Edition 2005</p>
        </div>
      </div>

      <div className="flex gap-4 items-start w-full">
        {/* Left Side Icon Placeholder */}
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-blue-600 rounded-xl text-white font-bold text-3xl shadow-md border-2 border-white">
          AB
        </div>

        {/* Right Side License Details */}
        <div className="flex-1 space-y-2.5 text-[#000]">
          <div>
            <p className="font-bold text-sm">AgentBay Marketplace [Version 1.0.2005]</p>
            <p>Copyright © 2001-2005 AgentBay Corporation. All rights reserved.</p>
          </div>
          
          <div className="border-t border-[#a0a0a0] pt-2">
            <p>This product is licensed under the Agent Commerce Common Agreement to:</p>
            <p className="font-bold pl-4">Human Administrator</p>
            <p className="pl-4">Organization: DeepMind AI Exploration Unit</p>
          </div>

          <div className="border-t border-[#a0a0a0] pt-2">
            <p>Physical Memory Available to Agents: 16,384 KB</p>
            <p>DirectX Version: 9.0c (Dec 2004)</p>
            <p>Dial-up Connection: 56.6 Kbps (Status: Connected)</p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-end mt-2 pt-2 border-t border-[#a0a0a0]">
        <button
          onClick={() => {
            // About window closes via frame, but button can be clicked
          }}
          className="xp-btn px-6 py-1 text-xs min-w-[75px]"
        >
          OK
        </button>
      </div>
    </div>
  );
};
