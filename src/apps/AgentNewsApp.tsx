import React, { useState } from 'react';
import { Newspaper, Rss, ArrowUpRight, TrendingUp } from 'lucide-react';
import { mockNews } from '../data/mockData';

export const AgentNewsApp: React.FC = () => {
  const [activeStory, setActiveStory] = useState(mockNews[0]);

  return (
    <div className="flex flex-col h-full bg-[#f6f6f0] font-sans text-xs">
      {/* Portal Header */}
      <div className="bg-[#b31b1b] text-white p-3 flex items-center justify-between border-b-2 border-[#801010]">
        <div className="flex items-center gap-2">
          <Newspaper size={20} />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider font-mono">MSN Agent News</h1>
            <p className="text-[9px] tracking-wide text-gray-200">The Voice of the Automated Economy</p>
          </div>
        </div>
        <div className="bg-white text-black px-2 py-0.5 font-bold border border-black rounded text-[10px]">
          Live Feed
        </div>
      </div>

      {/* Stock/Token Ticker */}
      <div className="bg-[#fff] border-b border-[#d8d8c8] px-3 py-1 flex items-center gap-6 text-[10px] overflow-hidden whitespace-nowrap">
        <span className="font-bold flex items-center gap-1 text-[#002d96] bg-white z-10 pr-2">
          <TrendingUp size={12} /> Ticker:
        </span>
        <div className="flex-1 overflow-hidden relative h-[14px]">
          <div className="absolute whitespace-nowrap animate-marquee flex gap-6">
            <span className="mx-2 text-[#008000]">COMPUTE/INR 2.45 ▲ +12.3%</span> | 
            <span className="mx-2 text-[#008000]">DATA_ETH 1.87 ▲ +2.4%</span> | 
            <span className="mx-2 text-[#800000]">CHAT_BTC 0.92 ▼ -1.8%</span> | 
            <span className="mx-2 text-[#008000]">AGENT_TRUST 98.2 ▲ +0.5%</span> |
            <span className="mx-2 text-[#008000]">LPT_INDEX 78.4 ▲ +4.2%</span>
          </div>
        </div>
      </div>


      {/* Body content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Headlines */}
        <div className="w-1/2 p-2 border-r border-[#d8d8c8] overflow-y-auto flex flex-col gap-2 bg-white">
          <div className="font-bold text-[#b31b1b] border-b border-[#e8e8df] pb-1 flex items-center gap-1">
            <Rss size={12} /> Today's Highlights
          </div>
          {mockNews.map((news) => (
            <div
              key={news.id}
              onClick={() => setActiveStory(news)}
              className={`p-2 border rounded cursor-pointer transition text-left ${
                activeStory.id === news.id
                  ? 'bg-[#ffebe6] border-[#f0c0b0]'
                  : 'bg-[#fafafa] border-[#e8e8e8] hover:bg-[#f6f6f0]'
              }`}
            >
              <h2 className="font-bold text-[#1b52ca] hover:underline text-xs leading-snug">
                {news.title}
              </h2>
              <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1">
                <span>{news.source}</span>
                <span>{news.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Article view & vintage ad banner */}
        <div className="w-1/2 p-3 overflow-y-auto flex flex-col gap-3">
          <div className="bg-white p-3 border border-[#d8d8c8] rounded shadow-sm flex-1">
            <span className="bg-[#b31b1b] text-white text-[9px] px-1 py-0.2 rounded font-bold uppercase">
              {activeStory.source}
            </span>
            <h2 className="text-sm font-bold text-black mt-1 mb-2 leading-tight">
              {activeStory.title}
            </h2>
            <p className="text-[11px] text-[#444] leading-relaxed">
              {activeStory.summary}
            </p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => alert("Full browser capabilities simulated. Links disabled in legacy sandbox.")}
                className="text-[#1b52ca] hover:underline font-bold flex items-center gap-0.5 text-[10px]"
              >
                Read full article <ArrowUpRight size={10} />
              </button>
            </div>
          </div>

          {/* Retro Advertisement Banner */}
          <div className="bg-gradient-to-r from-[#003c74] to-[#124ca4] text-white p-2 rounded border border-[#002d96] shadow text-center select-none">
            <div className="text-[9px] uppercase tracking-wider text-[#ffd700] font-bold">SPONSORED LINK</div>
            <div className="font-bold text-xs italic mt-0.5">Need More Compute?</div>
            <div className="text-[10px] opacity-95">Download RAM instantly at NetSpeed.com!</div>
            <div className="text-[8px] text-gray-300 mt-1">Warning: Requires Pentium 4 and 56k Modem.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
