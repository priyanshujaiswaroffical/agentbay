import React from 'react';
import type { Transaction } from '../types/os';
import type { UserProfile } from '../components/LoginScreen';
import { Download, ShieldCheck, Printer, Lock } from 'lucide-react';

interface SmartReceiptAppProps {
  selectedTransaction: Transaction | null;
  currentUser: UserProfile | null;
}

export const SmartReceiptApp: React.FC<SmartReceiptAppProps> = ({ selectedTransaction, currentUser }) => {
  // Only buyer and admin can view receipts
  if (currentUser?.role === 'seller') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f1efe7] font-sans p-6 text-center select-none text-xs">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center border border-red-300 mb-3">
          <Lock size={28} className="text-red-500" />
        </div>
        <p className="font-bold text-red-700">Access Restricted</p>
        <p className="text-gray-500 mt-1 max-w-[280px]">
          Receipts are only available to buyers. As a seller, check your listings in Marketplace.exe.
        </p>
      </div>
    );
  }

  if (!selectedTransaction) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f1efe7] font-sans p-6 text-center select-none text-xs">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border border-gray-400 mb-3">
          <Printer size={28} className="text-gray-500" />
        </div>
        <p className="font-bold text-[#002d96]">Smart Receipt Reader</p>
        <p className="text-gray-600 mt-1 max-w-[280px]">
          No receipt active. Double click a transaction in Transactions.exe or complete a run in ShoppingAgent.exe.
        </p>
      </div>
    );
  }

  const {
    id,
    timestamp,
    productName,
    originalPrice,
    finalPrice,
    savings,
    buyerAgent,
    sellerAgent,
    receiptId,
    negotiationTimeline,
  } = selectedTransaction;

  return (
    <div className="flex flex-col h-full bg-[#f1efe7] font-sans text-xs select-none">
      {/* Receipts Options Toolbar */}
      <div className="bg-[#ece9d8] border-b border-[#a0a0a0] p-1.5 flex items-center justify-between" data-print-hide>
        <span className="font-bold text-gray-700">Receipt Viewer — {receiptId}</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => window.print()}
            className="xp-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-semibold"
          >
            <Printer size={10} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={() => alert('Download simulated. Log exported to desktop.')}
            className="xp-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-semibold"
          >
            <Download size={10} />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Main receipt body: Dot matrix styling */}
      <div className="flex-1 p-4 overflow-y-auto flex justify-center bg-[#5c5c5c]">
        <div 
          className="w-full max-w-[360px] bg-[#fdfdfd] border-2 border-dashed border-gray-400 p-6 flex flex-col gap-4 text-black shadow-lg font-mono relative overflow-hidden"
          style={{
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.02) 100%)',
          }}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-3">
            <h1 className="text-sm font-black tracking-widest uppercase">AGENTBAY INC.</h1>
            <p className="text-[9px] text-gray-500">Autonomous Commerce Network</p>
            <p className="text-[9px] text-gray-500">Node ID: {receiptId.substring(0, 12)}</p>
            <p className="text-[10px] mt-1.5">{new Date(timestamp).toLocaleString()}</p>
          </div>

          {/* Metadata Grid */}
          <div className="text-[10px] space-y-1 py-1 border-b border-dashed border-gray-400">
            <div className="flex justify-between">
              <span>TX REF ID:</span>
              <span className="font-bold">{id.substring(0, 16)}</span>
            </div>
            <div className="flex justify-between">
              <span>BUYER AGENT:</span>
              <span className="text-[#0054e3] font-bold">{buyerAgent}</span>
            </div>
            <div className="flex justify-between">
              <span>SELLER AGENT:</span>
              <span className="text-[#d82b0e] font-bold">{sellerAgent}</span>
            </div>
          </div>

          {/* Line items */}
          <div className="py-2 border-b border-dashed border-gray-400">
            <div className="font-bold text-[10px] uppercase mb-1">Items Purchased</div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="max-w-[220px] truncate">{productName}</span>
                <span>1x</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 pl-2">
                <span>└ Original Listed Price</span>
                <span>₹{originalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Totals & Negotiation summary */}
          <div className="space-y-1.5 py-1 border-b border-dashed border-gray-400 text-xs">
            <div className="flex justify-between text-[10px]">
              <span>Original Total:</span>
              <span>₹{originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#ff4500] font-semibold">
              <span>Agent Bargain Saving:</span>
              <span>-₹{savings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-gray-300">
              <span>NET PAY AMOUNT:</span>
              <span className="text-[#008000]">₹{finalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Negotiation Log */}
          {negotiationTimeline && negotiationTimeline.length > 0 && (
            <div className="py-2 border-b border-dashed border-gray-400">
              <div className="font-bold text-[9px] uppercase mb-1.5 text-gray-600">Negotiation Audits</div>
              <div className="space-y-1 font-mono text-[9px] leading-tight text-gray-600">
                {negotiationTimeline.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic signature */}
          <div className="text-center pt-2">
            <div className="flex items-center justify-center gap-1 text-[9px] text-[#30a030] font-bold uppercase mb-1.5">
              <ShieldCheck size={12} /> Securely Audited & Sealed
            </div>
            <div className="text-[7px] text-gray-400 font-mono break-all leading-tight bg-gray-50 p-1 border border-gray-200">
              SHA256: 4e9f7831d8e1208fb3c2f90a187627cd9d592b0284ab9f7380cd01258dca89d1
            </div>
            <div className="text-[8px] text-gray-400 mt-2 italic">
              Thank you for trading through AgentBay.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
