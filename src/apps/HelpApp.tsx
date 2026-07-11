import React, { useState } from 'react';
import { HelpCircle, Search, Home, ArrowLeft, ArrowRight, Printer } from 'lucide-react';
import { mockHelpTopics } from '../data/mockData';

export const HelpApp: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState(mockHelpTopics[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = mockHelpTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#f1efe7] font-sans text-xs select-none">
      {/* Help Banner Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#1b52ca] to-[#3f8cf3] text-white">
        <div className="flex items-center gap-2">
          <HelpCircle size={24} className="text-white" />
          <div>
            <h1 className="text-sm font-bold">Help and Support Center</h1>
            <p className="text-[10px] opacity-90">AgentBay OS Assistance & Documentation</p>
          </div>
        </div>
        <div className="text-[10px] italic">Windows XP Professional</div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#ece9d8] border-b border-[#a0a0a0] px-2 py-1">
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#dfdfdf] border border-transparent hover:border-[#b0b0b0]">
            <Home size={14} className="text-[#0054e3]" />
            <span>Home</span>
          </button>
          <div className="w-[1px] h-4 bg-gray-400 mx-1" />
          <button 
            disabled 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded opacity-50 cursor-not-allowed"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <button 
            disabled 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded opacity-50 cursor-not-allowed"
          >
            <ArrowRight size={14} />
            <span>Forward</span>
          </button>
          <div className="w-[1px] h-4 bg-gray-400 mx-1" />
          <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#dfdfdf] border border-transparent hover:border-[#b0b0b0]">
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
        {/* Search Box */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="xp-input py-0.5 pr-6 w-[150px] text-xs"
            />
            <Search size={12} className="absolute right-1.5 top-1 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Main Panel split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Topics */}
        <div className="w-1/3 bg-white border-r border-[#a0a0a0] flex flex-col p-2 overflow-y-auto">
          <div className="font-bold text-[#002d96] border-b border-[#a0a0a0] pb-1 mb-2">Help Topics</div>
          <div className="space-y-1">
            {filteredTopics.map((topic) => (
              <button
                key={topic.title}
                onClick={() => setSelectedTopic(topic)}
                className={`w-full text-left p-1.5 rounded text-xs transition ${
                  selectedTopic.title === topic.title
                    ? 'bg-[#3f8cf3] text-white font-semibold'
                    : 'hover:bg-[#f1efe7] text-black'
                }`}
              >
                {topic.title}
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <p className="text-gray-500 italic p-1">No topics found matching query.</p>
            )}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <h2 className="text-sm font-bold text-[#002d96] border-b border-[#d8d8d8] pb-1.5 mb-3">
            {selectedTopic.title}
          </h2>
          <div className="text-xs text-black leading-relaxed space-y-4 whitespace-pre-line">
            {selectedTopic.content}
          </div>
        </div>
      </div>
    </div>
  );
};
