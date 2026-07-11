import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';

interface TrustCenterAppProps {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  fraudDetectionDetails: string[];
  securityStatus: string;
}

export const TrustCenterApp: React.FC<TrustCenterAppProps> = ({
  score = 98,
  riskLevel = 'Low',
  fraudDetectionDetails = [
    'Handshake signature verified (SHA-256)',
    'Escrow liquidity check passed (100% covered)',
    'IP address matching merchant node credentials',
    'No spam-bot double-bidding patterns detected'
  ],
  securityStatus = 'All security controls are ACTIVE. Your agents are operating in a secure sandbox.',
}) => {
  return (
    <div className="flex h-full bg-[#f1efe7] font-sans text-xs select-none">
      {/* Left blue panel sidebar */}
      <div className="w-1/4 bg-gradient-to-b from-[#248bf2] to-[#0054e3] text-white p-3 flex flex-col gap-4">
        <div>
          <h2 className="font-bold text-sm mb-1">Resources</h2>
          <div className="space-y-1.5 text-[10px]">
            <a href="#" className="block hover:underline text-[#ffd700] flex items-center gap-1">
              <span>•</span> Agent Security Guidelines
            </a>
            <a href="#" className="block hover:underline text-[#ffd700] flex items-center gap-1">
              <span>•</span> Ledger Audit Reports
            </a>
            <a href="#" className="block hover:underline text-[#ffd700] flex items-center gap-1">
              <span>•</span> Cryptography Status
            </a>
            <a href="#" className="block hover:underline text-[#ffd700] flex items-center gap-1">
              <span>•</span> Update Fraud Registry
            </a>
          </div>
        </div>

        <div className="border-t border-[#4fa5f5] pt-3 mt-auto">
          <p className="font-semibold text-[10px] leading-tight">
            Security Center keeps your agent sessions guarded by scanning all incoming network merchant proposals.
          </p>
        </div>
      </div>

      {/* Main Security Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col gap-4">
        {/* Header alert section */}
        <div className="flex items-start gap-3 p-3 bg-[#e6f2ff] border border-[#a0c8f0] rounded">
          <div className="w-12 h-12 rounded-full xp-shield-green flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#002d96]">Agent Security Center</h1>
            <p className="text-gray-700 leading-normal mt-0.5">{securityStatus}</p>
          </div>
        </div>

        {/* Security parameters */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800 text-xs border-b border-gray-200 pb-1 uppercase tracking-wider">
            Active Security Policies
          </h2>

          {/* Firewall Item */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-[#ece9d8] p-2 flex items-center justify-between border-b border-gray-300">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <Shield size={14} className="text-[#008000]" />
                <span>Agent Firewall</span>
              </div>
              <span className="text-[#008000] font-bold uppercase text-[10px]">ON</span>
            </div>
            <div className="p-2.5 bg-gray-50 text-gray-600 text-[11px] leading-relaxed">
              Active. Blocking unverified seller incoming handshakes. Restricting bidding frequencies to prevent denial of service (DoS) attacks on client nodes.
            </div>
          </div>

          {/* Verification Item */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-[#ece9d8] p-2 flex items-center justify-between border-b border-gray-300">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <ShieldCheck size={14} className="text-[#008000]" />
                <span>Merchant Verification Registry</span>
              </div>
              <span className="text-[#008000] font-bold uppercase text-[10px]">ACTIVE</span>
            </div>
            <div className="p-2.5 bg-gray-50 text-[11px]">
              <div className="flex justify-between font-semibold text-black mb-1">
                <span>Active Negotiation Session Trust Score:</span>
                <span className="text-[#008000]">{score}%</span>
              </div>
              <div className="flex justify-between font-semibold text-black mb-2">
                <span>Risk Level:</span>
                <span className={`font-bold ${riskLevel === 'Low' ? 'text-[#008000]' : 'text-[#c00]'}`}>
                  {riskLevel} Risk
                </span>
              </div>
              
              <div className="font-semibold text-gray-800 mb-1">Scans:</div>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                {fraudDetectionDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Escrow Item */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-[#ece9d8] p-2 flex items-center justify-between border-b border-gray-300">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <Shield size={14} className="text-[#008000]" />
                <span>Transaction Guard & Escrow</span>
              </div>
              <span className="text-[#008000] font-bold uppercase text-[10px]">ENFORCED</span>
            </div>
            <div className="p-2.5 bg-gray-50 text-gray-600 text-[11px] leading-relaxed">
              Enforcing secure approvals. Auto-buy ceiling is set in Settings.exe. Double spending detection is active in local ledger sandbox.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
