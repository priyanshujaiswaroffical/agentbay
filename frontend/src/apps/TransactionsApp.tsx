import React from 'react';
import { FileText, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import type { Transaction } from '../types/os';
import type { UserProfile } from '../components/LoginScreen';

interface TransactionsAppProps {
  transactions: Transaction[];
  currentUser: UserProfile | null;
  onSelectReceipt: (receipt: Transaction) => void;
}

export const TransactionsApp: React.FC<TransactionsAppProps> = ({
  transactions,
  currentUser,
  onSelectReceipt,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isSeller = currentUser?.role === 'seller';

  // Sellers cannot view the transactions registry
  if (isSeller) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white font-sans p-6 text-center select-none text-xs">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center border border-red-300 mb-3">
          <Lock size={28} className="text-red-500" />
        </div>
        <p className="font-bold text-red-700">Access Restricted</p>
        <p className="text-gray-500 mt-1 max-w-[280px]">
          Transaction registry is only available to buyers and admins.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white text-xs font-sans select-none">
      {/* Explorer Path Header */}
      <div className="bg-[#ece9d8] border-b border-[#a0a0a0] p-1.5 flex items-center justify-between text-[#000]">
        <div className="flex items-center gap-1">
          <span className="text-[#555] font-semibold">Address:</span>
          <span className="bg-white border border-[#7f9db9] px-2 py-0.5 w-[300px] flex items-center gap-1.5 select-all font-mono">
            C:\AgentBay\System32\Commerce\Registry\Transactions
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-300">
              🛡️ ADMIN VIEW — All Transactions
            </span>
          )}
          <span className="text-[10px] text-gray-500 font-mono pr-2">
            {transactions.length} Item(s) registered
          </span>
        </div>
      </div>

      {/* Explorer Columns Grid */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1efe7] border-b border-[#a0a0a0] text-[#000] font-semibold sticky top-0">
              <th className="p-2 border-r border-[#d4d0c8]">Transaction ID</th>
              <th className="p-2 border-r border-[#d4d0c8]">Product Name</th>
              <th className="p-2 border-r border-[#d4d0c8]">Final Price</th>
              <th className="p-2 border-r border-[#d4d0c8]">Saved</th>
              <th className="p-2 border-r border-[#d4d0c8]">Buyer Agent</th>
              {isAdmin && <th className="p-2 border-r border-[#d4d0c8]">Seller Agent</th>}
              <th className="p-2 border-r border-[#d4d0c8]">Timestamp</th>
              <th className="p-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                onDoubleClick={() => onSelectReceipt(tx)}
                className="border-b border-[#e8e8e8] hover:bg-[#ffeec2] active:bg-[#ffe7a2] cursor-pointer"
              >
                <td className="p-2 font-mono text-[#002d96] flex items-center gap-1.5">
                  <FileText size={14} className="text-[#3f8cf3] flex-shrink-0" />
                  <span>{tx.id.substring(0, 16)}</span>
                </td>
                <td className="p-2 font-bold">{tx.productName}</td>
                <td className="p-2 text-[#008000] font-bold">₹{tx.finalPrice.toLocaleString()}</td>
                <td className="p-2 text-[#ff4500] font-bold">₹{tx.savings.toLocaleString()}</td>
                <td className="p-2 text-gray-700">{tx.buyerAgent}</td>
                {isAdmin && <td className="p-2 text-[#8b4513] font-semibold">{tx.sellerAgent}</td>}
                <td className="p-2 text-gray-500">{new Date(tx.timestamp).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => onSelectReceipt(tx)}
                    className="xp-btn px-2 py-0.5 text-[10px] flex items-center gap-1 text-[#003c74] font-semibold"
                  >
                    <span>View</span>
                    <ArrowRight size={10} />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="p-6 text-center text-gray-500 italic">
                  No commerce logs registered yet. Type a query in ShoppingAgent.exe and complete a purchase.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Trust Signoff Bar */}
      <div className="bg-[#ece9d8] border-t border-[#a0a0a0] p-1.5 flex items-center gap-1 text-[10px] text-gray-700">
        <ShieldCheck className="text-[#30a030]" size={14} />
        <span>All logged transactions are cryptographically sealed in the local agent sandbox ledger.</span>
      </div>
    </div>
  );
};
