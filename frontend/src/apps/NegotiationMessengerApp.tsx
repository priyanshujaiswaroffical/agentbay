import React, { useEffect, useRef, useState } from 'react';
import { PhoneCall, Video, Send, Zap } from 'lucide-react';
import type { Message } from '../types/os';

interface NegotiationMessengerAppProps {
  chatHistory: Message[];
  isNegotiating: boolean;
  typingState: 'idle' | 'buyer_typing' | 'seller_typing';
  currentBargainPrice?: number;
  onSendHumanMessage?: (text: string) => void;
  onNudge?: () => void;
}

export const NegotiationMessengerApp: React.FC<NegotiationMessengerAppProps> = ({
  chatHistory,
  isNegotiating,
  typingState,
  currentBargainPrice,
  onSendHumanMessage,
  onNudge,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [humanInput, setHumanInput] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, typingState]);

  const handleSend = () => {
    if (!humanInput.trim()) return;
    onSendHumanMessage?.(humanInput.trim());
    setHumanInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-[#eef3f9] font-sans text-xs select-none">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-r border-[#a2b5cd]">
        {/* MSN Header */}
        <div className="bg-gradient-to-b from-[#fbfdfa] to-[#d6e5f4] border-b border-[#a0c2e6] p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Buyer avatar */}
            <div className="w-10 h-10 border border-gray-400 bg-white p-0.5 rounded shadow-sm relative flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-indigo-200 rounded flex items-center justify-center font-bold text-xs text-indigo-700">
                BA
              </div>
              <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 rounded-full bg-[#30a030] border-2 border-white shadow-sm" />
            </div>
            <div>
              <h2 className="font-bold text-black text-xs flex items-center gap-1.5">
                ShoppingAgent.exe (Buyer)
                <span className="font-normal text-[10px] text-gray-500">(Expert Negotiator)</span>
              </h2>
              <p className="text-[10px] text-gray-500 italic font-mono">
                {isNegotiating
                  ? typingState === 'buyer_typing' ? '✍ Buyer agent is typing...'
                  : typingState === 'seller_typing' ? '✍ Seller agent is typing...'
                  : 'Active negotiation in progress...'
                  : chatHistory.length === 0 ? 'Waiting for ShoppingAgent to deploy...'
                  : 'Session complete.'}
              </p>
            </div>
          </div>

          {/* Toolbar buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={onNudge}
              title="Send a Nudge"
              disabled={!isNegotiating}
              className="flex flex-col items-center px-2 py-1 rounded hover:bg-[#dbe7f4] disabled:opacity-40 border border-transparent hover:border-gray-300"
            >
              <Zap size={13} className="text-amber-500" />
              <span className="text-[8px] text-gray-500 mt-0.5">Nudge</span>
            </button>
            <button
              className="flex flex-col items-center px-2 py-1 rounded hover:bg-[#dbe7f4] opacity-40 cursor-not-allowed"
              disabled title="Voice Call (not available in AI sessions)"
            >
              <PhoneCall size={13} className="text-gray-500" />
              <span className="text-[8px] text-gray-500 mt-0.5">Voice</span>
            </button>
            <button
              className="flex flex-col items-center px-2 py-1 rounded hover:bg-[#dbe7f4] opacity-40 cursor-not-allowed"
              disabled title="Video Call (not available)"
            >
              <Video size={13} className="text-gray-500" />
              <span className="text-[8px] text-gray-500 mt-0.5">Video</span>
            </button>
          </div>
        </div>

        {/* Chat Viewport */}
        <div
          ref={scrollRef}
          className="flex-1 p-3 overflow-y-auto bg-[#fafcff] flex flex-col gap-2"
        >
          {/* Session header */}
          <div className="text-center text-gray-500 text-[9px] my-1 bg-[#ece9d8] p-1.5 border border-dashed border-gray-400 rounded">
            🔐 Encrypted autonomous bargaining session — 56kbps dial-up bandwidth
          </div>

          {chatHistory.length === 0 && !isNegotiating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400 text-[11px]">
                <div className="text-3xl mb-2">💬</div>
                <p>Deploy ShoppingAgent.exe to start a negotiation.</p>
                <p className="text-[9px] mt-1">Agent-to-agent messages will appear here in real time.</p>
              </div>
            </div>
          )}

          {chatHistory.map((msg, idx) => {
            if (msg.sender === 'System') {
              return (
                <div key={idx} className="text-center text-[9px] text-gray-500 bg-[#ece9d8] px-2 py-1 border border-dashed border-gray-300 rounded mx-4">
                  {msg.text}
                </div>
              );
            }

            const isBuyer = msg.sender === 'BuyerAgent';
            const isHuman = msg.sender === 'Human';

            return (
              <div key={idx} className={`flex gap-2 ${isBuyer || isHuman ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                  isBuyer  ? 'border-blue-400 bg-gradient-to-tr from-blue-300 to-indigo-100 text-indigo-700' :
                  isHuman  ? 'border-green-400 bg-gradient-to-tr from-green-200 to-emerald-100 text-green-700' :
                             'border-red-300 bg-gradient-to-tr from-orange-100 to-red-100 text-red-700'
                }`}>
                  {isBuyer ? 'BA' : isHuman ? '👤' : 'SA'}
                </div>

                {/* Bubble */}
                <div className={`max-w-[72%] flex flex-col ${isBuyer || isHuman ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-gray-400 mb-0.5 font-mono">
                    {isBuyer ? 'ShoppingAgent.exe' : isHuman ? 'You (Human)' : msg.sender} · {msg.timestamp}
                  </span>
                  <div className={`px-2.5 py-1.5 rounded text-[11px] leading-relaxed shadow-sm ${
                    isBuyer  ? 'bg-[#dcf3ff] border border-[#a8d8f0] text-gray-800 rounded-tr-none' :
                    isHuman  ? 'bg-[#dcffe4] border border-[#a0d8b0] text-gray-800 rounded-tr-none' :
                               'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.price && msg.price > 0 && (
                    <span className={`text-[9px] font-bold mt-0.5 ${
                      isBuyer ? 'text-blue-600' : isHuman ? 'text-green-700' : 'text-red-600'
                    }`}>
                      Offered: ₹{msg.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingState !== 'idle' && (
            <div className={`flex gap-2 ${typingState === 'buyer_typing' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                typingState === 'buyer_typing'
                  ? 'border-blue-400 bg-blue-50 text-indigo-700'
                  : 'border-red-300 bg-red-50 text-red-700'
              }`}>
                {typingState === 'buyer_typing' ? 'BA' : 'SA'}
              </div>
              <div className={`px-3 py-2 rounded shadow-sm bg-gray-100 border border-gray-200 flex items-center gap-1 ${
                typingState === 'buyer_typing' ? 'rounded-tr-none' : 'rounded-tl-none'
              }`}>
                <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Human Input Bar */}
        <div className="border-t border-[#a0c2e6] bg-[#f0f5fb] p-2">
          {/* Current price display */}
          {currentBargainPrice && currentBargainPrice > 0 && (
            <div className="text-[9px] text-gray-500 mb-1 font-mono">
              Current negotiated price: <span className="font-bold text-[#002d96]">₹{currentBargainPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="flex gap-1.5">
            <input
              type="text"
              className="xp-input flex-1 text-[11px]"
              placeholder={
                isNegotiating
                  ? 'Type to intervene in the negotiation...'
                  : 'Negotiation not active. Deploy ShoppingAgent first.'
              }
              value={humanInput}
              onChange={e => setHumanInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isNegotiating}
            />
            <button
              onClick={handleSend}
              disabled={!humanInput.trim() || !isNegotiating}
              className="xp-btn px-2 py-1 flex items-center gap-1 font-semibold disabled:opacity-40"
            >
              <Send size={11} />
              <span>Send</span>
            </button>
          </div>
          <p className="text-[8px] text-gray-400 mt-0.5">
            Press Enter to send · Your message will be injected into the negotiation log
          </p>
        </div>
      </div>

      {/* Right Sidebar — Session Info */}
      <div className="w-[170px] flex-shrink-0 bg-[#d6e5f4] border-l border-[#a2b5cd] flex flex-col text-[10px]">
        <div className="p-2 border-b border-[#a0c2e6]">
          <p className="font-bold text-[#002d96]">Session Details</p>
        </div>

        {/* Agents Online */}
        <div className="p-2 border-b border-[#a0c2e6]">
          <p className="font-bold text-[9px] uppercase text-gray-500 mb-1.5">Agents Online</p>
          {[
            { name: 'ShoppingAgent.exe', color: '#30a030', label: 'Buyer' },
            { name: 'NitroSales.exe', color: '#30a030', label: 'Seller' },
            { name: 'TrustGuard.exe', color: '#30a030', label: 'Auditor' },
          ].map(a => (
            <div key={a.name} className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
              <div>
                <div className="font-semibold text-[9px] text-gray-800 leading-none">{a.name}</div>
                <div className="text-[8px] text-gray-500">{a.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live stats */}
        <div className="p-2 border-b border-[#a0c2e6]">
          <p className="font-bold text-[9px] uppercase text-gray-500 mb-1.5">Live Stats</p>
          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Messages:</span>
              <span className="font-bold">{chatHistory.filter(m => m.sender !== 'System').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rounds:</span>
              <span className="font-bold">{Math.floor(chatHistory.filter(m => m.sender === 'BuyerAgent').length)}</span>
            </div>
            {currentBargainPrice ? (
              <div className="flex justify-between">
                <span className="text-gray-600">Curr Price:</span>
                <span className="font-bold text-[#002d96]">₹{currentBargainPrice.toLocaleString()}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Status */}
        <div className="p-2 mt-auto">
          <div className={`text-[9px] font-bold px-2 py-1 rounded text-center ${
            isNegotiating ? 'bg-[#e6f7e6] text-[#008000] border border-[#a0d0a0]' :
            chatHistory.length > 0 ? 'bg-[#fffbe6] text-[#806000] border border-[#d4c060]' :
            'bg-gray-100 text-gray-500 border border-gray-300'
          }`}>
            {isNegotiating ? '🟢 LIVE' : chatHistory.length > 0 ? '🟡 DONE' : '⚫ IDLE'}
          </div>
        </div>
      </div>
    </div>
  );
};
