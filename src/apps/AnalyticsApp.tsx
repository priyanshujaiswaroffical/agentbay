import React from 'react';
import { BarChart2, TrendingUp, DollarSign, Clock, ShieldCheck } from 'lucide-react';

export const AnalyticsApp: React.FC = () => {
  // Mock data for graphs
  const categorySavings = [
    { name: 'Laptops', value: 85, savings: '₹34,000' },
    { name: 'Hardware', value: 65, savings: '₹22,000' },
    { name: 'Datasets', value: 45, savings: '₹18,000' },
    { name: 'Agents', value: 30, savings: '₹9,500' },
  ];

  const transactionVolume = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 24 },
    { day: 'Thu', count: 15 },
    { day: 'Fri', count: 32 },
    { day: 'Sat', count: 8 },
    { day: 'Sun', count: 10 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] p-3 text-xs font-sans text-black select-none overflow-y-auto">
      {/* Header Stat Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Stat 1 */}
        <div className="bg-white border border-[#a0a0a0] p-2.5 rounded shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#d0e0fc] flex items-center justify-center border border-[#7ba2eb] text-[#0054e3] flex-shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block">Total Volume</span>
            <span className="font-bold text-sm">₹12.5 Lakhs</span>
          </div>
        </div>
        
        {/* Stat 2 */}
        <div className="bg-white border border-[#a0a0a0] p-2.5 rounded shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#d0fcda] flex items-center justify-center border border-[#7beb8c] text-[#008000] flex-shrink-0">
            <DollarSign size={16} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block">Money Saved</span>
            <span className="font-bold text-sm">₹83,500</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-[#a0a0a0] p-2.5 rounded shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#fcdcd0] flex items-center justify-center border-[#eba47b] text-[#ff4500] border flex-shrink-0">
            <Clock size={16} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block">Bargain Time</span>
            <span className="font-bold text-sm">4.2s (Avg)</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-[#a0a0a0] p-2.5 rounded shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#fcdcfc] flex items-center justify-center border-[#ea7beb] text-[#800080] border flex-shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block">Success Rate</span>
            <span className="font-bold text-sm">98.4%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Category Savings 3D Bar Chart */}
        <div className="bg-white border border-[#a0a0a0] p-3 rounded flex flex-col">
          <h3 className="font-bold text-[#002d96] border-b border-[#e8e8df] pb-1.5 mb-3 flex items-center gap-1.5">
            <BarChart2 size={14} />
            <span>Negotiation Savings by Category</span>
          </h3>
          <div className="flex-1 flex flex-col justify-around">
            {categorySavings.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between font-semibold text-[10px]">
                  <span>{cat.name}</span>
                  <span className="text-[#008000]">{cat.savings} saved</span>
                </div>
                <div className="w-full bg-[#f1efe7] h-6 rounded border border-gray-400 p-0.5 relative overflow-hidden flex">
                  {/* Glossy Bar */}
                  <div
                    style={{ width: `${cat.value}%` }}
                    className="h-full bg-gradient-to-r from-[#248bf2] to-[#0054e3] rounded shadow-[inset_1px_1px_1px_#ffffff,inset_-1px_-1px_1px_#002080] relative"
                  >
                    {/* Shiny white overlay */}
                    <div className="absolute top-0 left-0 w-full h-[30%] bg-white opacity-30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction count line grid */}
        <div className="bg-white border border-[#a0a0a0] p-3 rounded flex flex-col">
          <h3 className="font-bold text-[#002d96] border-b border-[#e8e8df] pb-1.5 mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} />
            <span>Weekly Agent Session Volume</span>
          </h3>
          <div className="flex-1 flex items-end justify-between px-2 pt-4 pb-2 border-b border-l border-gray-300 relative h-36">
            {/* Horizontal helper lines */}
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-gray-200 pointer-events-none" />
            <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-gray-200 pointer-events-none" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-gray-200 pointer-events-none" />
            
            {transactionVolume.map((vol) => (
              <div key={vol.day} className="flex flex-col items-center gap-1.5 z-10 w-8">
                {/* 3D Vertical Bar */}
                <div
                  style={{ height: `${(vol.count / 35) * 100}px` }}
                  className="w-5 bg-gradient-to-b from-[#3cc03c] to-[#287428] rounded-t-sm shadow-[inset_1px_1px_1px_#ffffff,inset_-1px_-1px_1px_#104010] relative hover:brightness-110 cursor-pointer"
                  title={`${vol.count} sessions`}
                >
                  <div className="absolute top-0 left-0 w-full h-[25%] bg-white opacity-40" />
                </div>
                <span className="text-[9px] font-semibold text-gray-500 font-mono">{vol.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 bg-[#fdfaf2] border border-[#d8b080] p-2.5 rounded text-[10px] text-gray-700 leading-relaxed">
        * System diagnostics show active LLM network overhead is stable at 24.3 tokens per transaction. Auto-caching is active in the registry keys.
      </div>
    </div>
  );
};
