import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Download, AlertTriangle, CheckCircle, ShieldAlert, Zap, Bot } from 'lucide-react';
import type { Message, Transaction } from '../types/os';
import {
  callGemini, getStoredApiKey,
  BUYER_SYSTEM_PROMPT, SELLER_SYSTEM_PROMPT,
  type GeminiMessage,
} from '../services/geminiService';
import { playOfferSound, playCounterSound } from '../services/soundService';
import type { Product } from '../types/os';

interface ShoppingAgentAppProps {
  products: Product[];
  onStartNegotiation: (chat: Message[], currentPrice: number) => void;
  onUpdateNegotiation: (
    chat: Message[] | ((prev: Message[]) => Message[]),
    currentPrice: number,
    typing: 'idle' | 'buyer_typing' | 'seller_typing'
  ) => void;
  onFinishNegotiation: (tx: Transaction | null) => void;
  onShowNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  onOpenApp: (appId: any) => void;
  initialPrompt: string;
  onClearInitialPrompt: () => void;
  onRegisterHumanMsgHandler?: (handler: (msg: string) => void) => void;
  controlSettings: {
    negotiationAggressiveness: number;
    minTrustScore: number;
    autoBuyLimit: number;
    soundEnabled: boolean;
    verificationRequired: boolean;
  };
}

type RunState =
  | 'idle' | 'searching' | 'comparing' | 'reviewing'
  | 'negotiating_ai' | 'verifying' | 'uac_popup'
  | 'completed' | 'denied' | 'error';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const ShoppingAgentApp: React.FC<ShoppingAgentAppProps> = ({
  products,
  onStartNegotiation,
  onUpdateNegotiation,
  onFinishNegotiation,
  onShowNotification,
  onOpenApp,
  initialPrompt,
  onClearInitialPrompt,
  onRegisterHumanMsgHandler,
  controlSettings,
}) => {
  const [prompt, setPrompt] = useState('I need a gaming laptop under ₹70,000 with good graphics.');
  const [runState, setRunState] = useState<RunState>('idle');
  const [progress, setProgress] = useState(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [activeResult, setActiveResult] = useState<Transaction | null>(null);
  const [uacProduct, setUacProduct] = useState<{ name: string; price: number } | null>(null);
  const abortRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const pendingHumanMsgRef = useRef<string>(''); // Human chat messages injected into buyer context

  // Register handler so App.tsx can inject human messages into active negotiation
  useEffect(() => {
    if (typeof onRegisterHumanMsgHandler === 'function') {
      onRegisterHumanMsgHandler((msg: string) => {
        pendingHumanMsgRef.current = msg;
      });
    }
  }, [onRegisterHumanMsgHandler]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logMessages]);

  const addLog = useCallback((msg: string, type: 'info' | 'ok' | 'warn' | 'ai' = 'info') => {
    const prefix = { info: '›', ok: '✓', warn: '⚠', ai: '🤖' }[type];
    setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${prefix} ${msg}`]);
  }, []);

  const pushMsg = useCallback((sender: Message['sender'], text: string, price?: number) => {
    const msg: Message = {
      id: Date.now().toString() + Math.random(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString(),
      price,
    };
    onUpdateNegotiation(prev => [...prev, msg], price ?? 0, 'idle');
    return msg;
  }, [onUpdateNegotiation]);

  // Find best product match from prompt using keyword matching and substring scoring
  const findMatchingProduct = (userPrompt: string) => {
    const lower = userPrompt.toLowerCase();
    
    // Filter out common stop words to isolate search keywords
    const stopWords = new Set(['i', 'need', 'a', 'an', 'the', 'under', 'with', 'for', 'to', 'in', 'of', 'and', 'or', 'is', 'at', 'on', 'my', 'you', 'your', 'please']);
    const promptWords = lower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w));

    let best = products[0];
    let bestScore = -999999;

    for (const p of products) {
      let score = 0;
      const pNameLower = p.name.toLowerCase();
      const pLower = (p.name + ' ' + p.category + ' ' + p.description + ' ' + p.specs).toLowerCase();

      // 1. Direct name match gets huge boost
      if (lower.includes(pNameLower)) {
        score += 80;
      }

      // 2. Individual keyword matches
      let matchedKeywords = 0;
      for (const word of promptWords) {
        if (pNameLower.includes(word)) {
          score += 25;
          matchedKeywords++;
        } else if (pLower.includes(word)) {
          score += 8;
        }
      }

      // 3. Category matches
      if (lower.includes('laptop') && p.category === 'Laptops') score += 15;
      if (lower.includes('gpu') || lower.includes('graphics') || lower.includes('video card') || lower.includes('display')) {
        if (p.category === 'Hardware' || pLower.includes('geforce') || pLower.includes('graphics') || pLower.includes('radeon')) score += 15;
      }
      if (lower.includes('dataset') && p.category === 'Datasets') score += 15;
      if (lower.includes('agent') && p.category === 'Agent Services') score += 15;
      if (lower.includes('gaming') && pLower.includes('gaming')) score += 5;
      if (lower.includes('sound') && pLower.includes('sound')) score += 5;

      // 4. Budget penalty (soft penalty to avoid completely ignoring matched products over budget)
      const budgetMatch = lower.match(/(?:under|below|max|budget|for|at|around)?\s*₹?\s*(\d[\d,]*)/);
      if (budgetMatch) {
        const budget = parseInt(budgetMatch[1].replace(/,/g, ''));
        if (budget > 0) {
          if (p.price <= budget) {
            score += 10; // Preference to stay within budget
          } else {
            // Apply a small penalty proportional to how far over budget it is
            const overPercent = (p.price - budget) / budget;
            score -= Math.min(40, Math.floor(overPercent * 30));
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  };

  const handleStop = () => {
    abortRef.current = true;
    setRunState('idle');
    setProgress(0);
    addLog('Run aborted by user.', 'warn');
    onFinishNegotiation(null);
  };

  const handleExportLog = () => {
    const text = logMessages.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `agentbay_log_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    if (!prompt.trim()) return;

    const hasKey = !!getStoredApiKey();
    abortRef.current = false;

    setRunState('searching');
    setProgress(5);
    setLogMessages([]);
    setActiveResult(null);

    addLog(`Deploying ShoppingAgent with prompt: "${prompt}"`, 'info');
    if (!hasKey) {
      addLog('No Gemini API key found — running in DEMO mode. Go to Settings.exe → AI Config to add your key.', 'warn');
    } else {
      addLog('Gemini API key found. Real AI negotiation enabled.', 'ok');
    }

    // ── STAGE 1: SEARCHING ──
    await sleep(1200);
    if (abortRef.current) return;
    const product = findMatchingProduct(prompt);
    setProgress(20);
    addLog(`Scanning Marketplace.exe — ${products.length} listings indexed...`, 'info');
    await sleep(600);
    addLog(`Match found: "${product.name}" by ${product.sellerName} at ₹${product.price.toLocaleString()}`, 'ok');

    // ── STAGE 2: COMPARING ──
    setRunState('comparing');
    await sleep(1000);
    if (abortRef.current) return;
    setProgress(38);
    addLog('ComparisonEngine ranking candidates by specs + price...', 'info');
    await sleep(700);
    addLog(`Best fit: ${product.name} (Trust: ${product.sellerTrust}% | Condition: ${product.condition})`, 'ok');

    if (product.sellerTrust < controlSettings.minTrustScore) {
      addLog(`Seller trust ${product.sellerTrust}% is below minimum ${controlSettings.minTrustScore}%. Aborting.`, 'warn');
      setRunState('denied');
      setProgress(0);
      onShowNotification('Trust Violation', `Seller trust score too low (${product.sellerTrust}%).`, 'warning');
      onFinishNegotiation(null);
      return;
    }

    // ── STAGE 3: REVIEWING ──
    setRunState('reviewing');
    await sleep(1000);
    if (abortRef.current) return;
    setProgress(52);
    addLog('ReviewerBot.exe scanning customer feedback corpus...', 'info');
    await sleep(800);
    addLog('Sentiment: 92% positive. No fake review patterns detected.', 'ok');

    // ── STAGE 4: AI NEGOTIATION ──
    setRunState('negotiating_ai');
    setProgress(60);
    addLog('Launching MSN Messenger negotiation channel...', 'info');
    onShowNotification('MSN Messenger', `Bargaining session started: ${product.sellerAgent}`, 'info');

    const initialChat: Message[] = [];
    onStartNegotiation(initialChat, product.price);
    onOpenApp('messenger');

    let finalPrice = product.price;
    let dealMade = false;
    const minAcceptable = product.minAcceptablePrice || Math.floor(product.price * 0.80); // seller floor or default to 80%


    const buyerHistory: GeminiMessage[] = [];
    const sellerHistory: GeminiMessage[] = [];

    // Extract budget by looking for explicit price terms (under/below/₹/Rs/budget/etc.)
    let promptBudget = 0;
    const explicitBudgetMatch = prompt.match(/(?:under|below|max|upto|within|budget|price|for|at|rs\.?|inr|₹)\s*[₹rs$]?\s*(\d[\d,]+)/i);
    if (explicitBudgetMatch) {
      promptBudget = parseInt(explicitBudgetMatch[1].replace(/,/g, ''));
    } else {
      // Fallback: search from right to left for any number >= 1000, which usually represents the price/budget at the end of the query
      const allNumbers = prompt.match(/\b\d[\d,]*\b/g);
      if (allNumbers) {
        for (let i = allNumbers.length - 1; i >= 0; i--) {
          const num = parseInt(allNumbers[i].replace(/,/g, ''));
          if (num >= 1000 && num <= 10000000) {
            promptBudget = num;
            break;
          }
        }
      }
    }
    // Use prompt budget if it's a sensible value (between 1000 and 10,000,000), else fall back to settings
    const budget = (promptBudget >= 1000 && promptBudget < 10_000_000)
      ? promptBudget
      : (controlSettings.autoBuyLimit || product.price);
    addLog(`Buyer budget ceiling: ₹${budget.toLocaleString()} (from ${promptBudget >= 1000 ? 'your prompt' : 'settings'})`, 'info');

    const buyerSysPrompt = BUYER_SYSTEM_PROMPT(
      'ShoppingAgent.exe', product.name, product.price,
      budget, controlSettings.negotiationAggressiveness
    );
    const sellerSysPrompt = SELLER_SYSTEM_PROMPT(
      product.sellerAgent, product.name, product.price, minAcceptable
    );

    const MAX_ROUNDS = 8; // Natural deal — ends when agents agree, not forced
    const PRICE_FLOOR = Math.floor(product.price * 0.60); // Sanity guard: reject AI hallucinations below this
    const PRICE_CEIL  = Math.floor(product.price * 1.05); // Reject wild overbids too

    for (let round = 0; round < MAX_ROUNDS; round++) {
      if (abortRef.current) return;

      // ── Buyer turn ──
      onUpdateNegotiation(prev => prev, 0, 'buyer_typing');
      addLog(`Round ${round + 1}/${MAX_ROUNDS}: Buyer agent composing offer...`, 'ai');
      await sleep(400);

      let buyerText: string;
      if (hasKey) {
        try {
          // Pull any human chat message the user sent during negotiation
          // Human messages are HIGH PRIORITY — treated as override directives, not hints
          const humanMsg = pendingHumanMsgRef.current;
          pendingHumanMsgRef.current = ''; // consume it

          // Try to parse a bid amount from the human message to use directly
          const humanBidMatch = humanMsg?.match(/₹?\s*([\d,]+)/);
          const humanBidAmount = humanBidMatch ? parseInt(humanBidMatch[1].replace(/,/g, ''), 10) : 0;

          const humanNote = humanMsg
            ? ` IMPORTANT OVERRIDE FROM HUMAN BUYER: "${humanMsg}"${humanBidAmount > 0 ? ` Your next offer MUST be exactly ₹${humanBidAmount.toLocaleString()} as instructed by the human.` : ' Follow the human buyer\'s instructions as your top priority, overriding your usual strategy.'}`
            : '';

          const context = round === 0
            ? `Start the negotiation. The seller listed "${product.name}" at ₹${product.price.toLocaleString()}. Your budget ceiling is ₹${budget.toLocaleString()}. Make your opening offer now — it MUST be below ₹${Math.floor(product.price * 0.90).toLocaleString()}.${humanNote}`
            : `Continue negotiating. Last seller message: "${sellerHistory[sellerHistory.length - 1]?.parts[0]?.text ?? ''}". Increase your bid appropriately.${humanNote}`;
          buyerHistory.push({ role: 'user', parts: [{ text: context }] });
          buyerText = await callGemini(buyerHistory, buyerSysPrompt);
          buyerHistory.push({ role: 'model', parts: [{ text: buyerText }] });
        } catch (e: any) {
          addLog(`Gemini error: ${e.message}. Switching to demo mode.`, 'warn');
          buyerText = getDemoBuyerText(round, product.price, controlSettings.negotiationAggressiveness, budget, product.name);
        }
      } else {
        await sleep(800);
        buyerText = getDemoBuyerText(round, product.price, controlSettings.negotiationAggressiveness, budget, product.name);
      }

      // Check if buyer declared deal/failure
      if (/NEGOTIATION FAILED/i.test(buyerText)) {
        pushMsg('BuyerAgent', buyerText);
        addLog('Buyer agent: budget limit reached. Negotiation failed.', 'warn');
        setRunState('denied');
        setProgress(0);
        onShowNotification('Negotiation Failed', 'Could not reach a deal within budget.', 'warning');
        onFinishNegotiation(null);
        return;
      }

      // Extract price from buyer message — with sanity guard
      let offeredPrice = parsePriceFromText(buyerText);

      // If AI price is missing, above ceiling, or above budget → use demo fallback (NOT budget directly)
      const needsFallback = !offeredPrice || offeredPrice < PRICE_FLOOR || offeredPrice > PRICE_CEIL || offeredPrice > budget;
      if (needsFallback) {
        if (offeredPrice && offeredPrice > budget) {
          addLog(`⚠ AI bid ₹${offeredPrice.toLocaleString()} exceeds budget. Using calculated offer.`, 'warn');
        }
        const demoText = getDemoBuyerText(round, product.price, controlSettings.negotiationAggressiveness, budget, product.name);
        offeredPrice = parsePriceFromText(demoText) ?? PRICE_FLOOR;
        buyerText = demoText; // replace entire buyer message with clean demo text
      }
      const displayPrice = offeredPrice ?? finalPrice;

      pushMsg('BuyerAgent', buyerText, displayPrice);
      playOfferSound(); // 🔊 buyer made an offer
      if (offeredPrice) finalPrice = offeredPrice;
      await sleep(500);

      // ── Seller turn ──
      onUpdateNegotiation(prev => prev, finalPrice, 'seller_typing');
      addLog(`Round ${round + 1}: Seller agent responding...`, 'ai');

      let sellerText: string;
      if (hasKey) {
        try {
          const context = `Buyer just said: "${buyerText}". Their current offer is ₹${offeredPrice?.toLocaleString() ?? finalPrice.toLocaleString()}. Respond professionally.`;
          sellerHistory.push({ role: 'user', parts: [{ text: context }] });
          sellerText = await callGemini(sellerHistory, sellerSysPrompt);
          sellerHistory.push({ role: 'model', parts: [{ text: sellerText }] });
        } catch (e: any) {
          sellerText = getDemoSellerText(round, product.price, minAcceptable, offeredPrice, product.name);
        }
      } else {
        await sleep(900);
        sellerText = getDemoSellerText(round, product.price, minAcceptable, offeredPrice, product.name);
      }

      // Check if seller walked away or rejected due to offer being below floor
      if (/NEGOTIATION (ENDED|FAILED)|BELOW FLOOR/i.test(sellerText)) {
        pushMsg('SellerAgent', sellerText);
        addLog(`Seller agent: negotiation aborted because offer is below floor of ₹${minAcceptable.toLocaleString()}.`, 'warn');
        setRunState('denied');
        setProgress(0);
        onShowNotification('Negotiation Ended', 'Seller walked away: offer below minimum floor price.', 'warning');
        onFinishNegotiation(null);
        return;
      }

      // Check if seller accepted
      if (/DEAL (CONFIRMED|ACCEPTED)/i.test(sellerText)) {
        const parsedDealPrice = parsePriceFromText(sellerText);
        finalPrice = parsedDealPrice ?? finalPrice;
        
        // Final sanity check: if the deal price is strictly above the budget, reject it
        if (finalPrice > budget) {
          addLog(`Negotiation failed. Settle price ₹${finalPrice.toLocaleString()} exceeds budget ceiling ₹${budget.toLocaleString()}.`, 'warn');
          setRunState('denied');
          setProgress(0);
          onShowNotification('Budget Violation', 'Negotiation failed: final price exceeded your budget limit.', 'warning');
          onFinishNegotiation(null);
          return;
        }
        
        pushMsg('SellerAgent', sellerText, finalPrice);
        playCounterSound(); // 🔊 seller accepted
        dealMade = true;
        addLog(`Deal reached! Final price: ₹${finalPrice.toLocaleString()}`, 'ok');
        break;
      }

      // Parse seller price counter offer
      const sellerOffer = parsePriceFromText(sellerText);
      if (sellerOffer) {
        if (sellerOffer >= PRICE_FLOOR && sellerOffer <= PRICE_CEIL) {
          finalPrice = sellerOffer;
        }
      }

      pushMsg('SellerAgent', sellerText, finalPrice);
      playCounterSound(); // 🔊 seller made a counter offer

      // If seller's latest counter is strictly above the budget ceiling, and it's the last round, fail negotiation
      if (sellerOffer && sellerOffer > budget && round === MAX_ROUNDS - 1) {
        addLog(`Negotiation failed. Seller counter-offer ₹${sellerOffer.toLocaleString()} is above budget limit ₹${budget.toLocaleString()}.`, 'warn');
        setRunState('denied');
        setProgress(0);
        onShowNotification('Budget Limit Reached', 'Negotiation failed: budget ceiling exceeded.', 'warning');
        onFinishNegotiation(null);
        return;
      }

      // Auto-deal triggers when buyer and seller offers converge (within 4% gap)
      if (offeredPrice && sellerOffer) {
        const gap = Math.abs(sellerOffer - offeredPrice) / sellerOffer;
        if (gap < 0.04) {
          // Mid-point settlement if it satisfies the budget limit
          const midPrice = Math.floor((sellerOffer + offeredPrice) / 2);
          if (midPrice <= budget) {
            finalPrice = midPrice;
            dealMade = true;
            addLog(`Prices converged. Auto-deal triggered.`, 'ok');
            pushMsg('System', `🤝 Both agents agreed at ₹${finalPrice.toLocaleString()}.`);
            break;
          }
        }
      }

      setProgress(60 + round * 4);
      await sleep(1800); // pace rounds so user can follow the chat
    }

    if (!dealMade) {
      // Last resort: If the seller's final offer is within budget, accept it. Otherwise fail.
      if (finalPrice <= budget) {
        addLog(`Max rounds reached. Settle best price: ₹${finalPrice.toLocaleString()}`, 'warn');
        dealMade = true;
      } else {
        addLog(`Negotiation failed. Seller final offer ₹${finalPrice.toLocaleString()} is above budget limit ₹${budget.toLocaleString()}.`, 'warn');
        setRunState('denied');
        setProgress(0);
        onShowNotification('Negotiation Failed', 'Budget limit reached before convergence.', 'warning');
        onFinishNegotiation(null);
        return;
      }
    }

    // ── STAGE 5: VERIFICATION ──
    setRunState('verifying');
    setProgress(85);
    await sleep(800);
    if (abortRef.current) return;
    addLog('TrustGuard.exe verifying transaction cryptography...', 'info');
    await sleep(600);
    addLog('Escrow check passed. Seller signature valid.', 'ok');
    setProgress(92);

    // ── UAC POPUP ──
    if (controlSettings.verificationRequired) {
      setRunState('uac_popup');
      setUacProduct({ name: product.name, price: finalPrice });
      return;
    }

    completeTransaction(product, finalPrice);
  };

  const completeTransaction = (
    product: Product,
    finalPrice: number
  ) => {
    const savings = product.price - finalPrice;
    const tx: Transaction = {
      id: `TX-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      productName: product.name,
      originalPrice: product.price,
      finalPrice,
      savings,
      buyerAgent: 'ShoppingAgent.exe',
      sellerAgent: product.sellerAgent,
      receiptId: `RCPT-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      negotiationTimeline: logMessages.slice(-6),
    };

    onFinishNegotiation(tx);
    setActiveResult(tx);
    setRunState('completed');
    setProgress(100);
    addLog(`Transaction complete! Saved ₹${savings.toLocaleString()} (${Math.round((savings / product.price) * 100)}% off)`, 'ok');
    onShowNotification('Purchase Complete! 🎉', `${product.name} — Final price ₹${finalPrice.toLocaleString()} (Saved ₹${savings.toLocaleString()})`, 'success');
  };

  const handleUacApprove = () => {
    const product = products.find(p => p.name === uacProduct?.name) || products[0];
    setUacProduct(null);
    completeTransaction(product, uacProduct?.price || product.price);
  };

  const handleUacDeny = () => {
    setUacProduct(null);
    setRunState('denied');
    setProgress(0);
    addLog('User denied purchase. Transaction cancelled.', 'warn');
    onShowNotification('Purchase Denied', 'You cancelled the transaction.', 'warning');
    onFinishNegotiation(null);
  };

  const isRunning = ['searching', 'comparing', 'reviewing', 'negotiating_ai', 'verifying'].includes(runState);

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] font-sans text-xs select-none relative">
      {/* UAC Popup overlay */}
      {runState === 'uac_popup' && uacProduct && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-[#ece9d8] border-t-4 border-[#0054e3] w-[400px] shadow-2xl">
            <div className="xp-titlebar px-3 py-1.5 flex items-center gap-2">
              <ShieldAlert size={14} />
              <span>User Account Control — Purchase Authorization</span>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-4">
                <div className="w-14 h-14 bg-[#ffd700] rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2 border-[#b8a000]">
                  🔐
                </div>
                <div>
                  <p className="font-bold text-sm text-[#002d96]">Approve AI Agent Purchase?</p>
                  <p className="text-gray-700 mt-1 text-[11px] leading-relaxed">
                    ShoppingAgent.exe is requesting authorization to complete a purchase:
                  </p>
                  <p className="font-bold text-[#002d96] text-sm mt-2">
                    {uacProduct.name}
                  </p>
                  <p className="text-[#008000] font-black text-lg">
                    ₹{uacProduct.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-[#fff8dc] border border-[#c8a000] p-2 rounded text-[10px] text-gray-700 mb-4">
                ⚠ This action will authorize the AI agent to finalize the transaction. Money will be deducted from your balance.
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={handleUacDeny} className="xp-btn px-4 py-1.5 font-semibold">
                  ✕ Deny
                </button>
                <button
                  onClick={handleUacApprove}
                  className="px-5 py-1.5 font-bold text-white text-xs rounded"
                  style={{ background: 'linear-gradient(to bottom, #3f8cf3, #0054e3)' }}
                >
                  ✓ Allow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[#f1efe7] border-b border-[#a0a0a0] p-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bot size={16} className="text-[#3cc03c]" />
          <span className="font-bold text-[#002d96]">ShoppingAgent.exe</span>
          <span className="text-gray-500 text-[10px]">— Autonomous Purchase Orchestrator</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleExportLog} disabled={logMessages.length === 0}
            className="xp-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-semibold disabled:opacity-40">
            <Download size={10} /> Export Log
          </button>
          {isRunning ? (
            <button onClick={handleStop}
              className="xp-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-semibold text-red-700 border-red-400">
              <Square size={10} /> Stop Run
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={!prompt.trim()}
              className="px-3 py-0.5 text-[10px] font-bold text-white rounded flex items-center gap-1 disabled:opacity-40"
              style={{ background: 'linear-gradient(to bottom, #3cc03c, #228022)' }}
            >
              <Play size={10} /> Deploy Agent
            </button>
          )}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="p-3 bg-white border-b border-[#d4d0c8]">
        <label className="block font-bold text-gray-700 mb-1.5 text-[11px]">
          🎯 What do you want your agent to buy?
        </label>
        <textarea
          className="xp-input w-full text-[11px] resize-none leading-relaxed"
          rows={3}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={isRunning}
          placeholder="e.g. I need a gaming laptop under ₹75,000 with a good GPU for 3D rendering..."
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-[9px] text-gray-400">Be specific for better AI matching. Budget, category, specs all help.</span>
          <span className="text-[9px] text-gray-400">{getStoredApiKey() ? '🟢 Gemini AI Active' : '🟡 Demo Mode (set API key in Settings)'}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {(isRunning || runState === 'completed') && (
        <div className="px-3 py-2 bg-[#f1efe7] border-b border-[#d4d0c8]">
          <div className="flex justify-between mb-1">
            <span className="font-bold text-[10px] text-[#002d96]">
              {runState === 'searching'       ? '🔍 Searching Marketplace...' :
               runState === 'comparing'       ? '📊 Comparing Products...' :
               runState === 'reviewing'       ? '⭐ Reviewing Listings...' :
               runState === 'negotiating_ai'  ? '🤖 AI Negotiating with Seller...' :
               runState === 'verifying'       ? '🔐 Verifying Transaction...' :
               runState === 'completed'       ? '✅ Transaction Complete!' : ''}
            </span>
            <span className="text-[10px] font-bold text-[#002d96]">{progress}%</span>
          </div>
          <div className="xp-loader">
            <div className="xp-loader-bar">
              {Array.from({ length: Math.max(1, Math.floor(progress / 8)) }).map((_, i) => (
                <div key={i} className="xp-loader-block flex-none" style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completion Result */}
      {runState === 'completed' && activeResult && (
        <div className="mx-3 mt-2 p-3 bg-[#e6ffe6] border border-[#30a030] rounded flex items-center gap-3">
          <CheckCircle size={28} className="text-[#008000] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[#004400] text-sm">Purchase Authorized! 🎉</p>
            <p className="text-[11px] text-gray-700 mt-0.5">
              <strong>{activeResult.productName}</strong> — paid ₹{activeResult.finalPrice.toLocaleString()} &nbsp;
              <span className="text-[#ff4500] font-bold">(Saved ₹{activeResult.savings.toLocaleString()}!)</span>
            </p>
          </div>
          <button onClick={() => onOpenApp('receipt')}
            className="xp-btn px-2 py-1 text-[10px] font-semibold">
            📄 Receipt
          </button>
        </div>
      )}

      {runState === 'denied' && (
        <div className="mx-3 mt-2 p-3 bg-[#fff0f0] border border-[#cc0000] rounded flex items-center gap-3">
          <AlertTriangle size={24} className="text-[#cc0000] flex-shrink-0" />
          <div>
            <p className="font-bold text-[#880000]">Negotiation Denied or Failed</p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Check the log below for details. Adjust settings or try a different product.
            </p>
          </div>
        </div>
      )}

      {runState === 'error' && (
        <div className="mx-3 mt-2 p-3 bg-[#fff0f0] border border-orange-400 rounded flex items-center gap-3">
          <Zap size={24} className="text-orange-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-orange-700">AI Error</p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Gemini API error occurred. Check your API key in Settings.exe → AI Config.
            </p>
          </div>
        </div>
      )}

      {/* Log Terminal — hidden by default, toggled via button */}
      <div className="mx-3 mt-1 mb-2">
        <button
          onClick={() => setShowLog(v => !v)}
          className="text-[9px] text-gray-500 underline hover:text-gray-700"
        >
          {showLog ? '▲ Hide agent log' : '▼ Show agent log'}
        </button>
        {showLog && (
          <div className="bg-[#0d0d0d] text-[#00ff00] font-mono text-[9px] max-h-32 overflow-y-auto p-2 mt-1 rounded border border-gray-600 leading-relaxed" ref={logRef}>
            {logMessages.length === 0 ? (
              <div className="text-gray-600 italic">Agent terminal ready.</div>
            ) : (
              logMessages.map((msg, i) => (
                <div key={i} className={`leading-tight ${
                  msg.includes('✓') ? 'text-[#00ff00]' :
                  msg.includes('⚠') ? 'text-yellow-400' :
                  msg.includes('🤖') ? 'text-cyan-400' : 'text-[#90c090]'
                }`}>
                  {msg.length > 120 ? msg.slice(0, 120) + '…' : msg}
                </div>
              ))
            )}
            {isRunning && <div className="text-[#00ff00] animate-pulse">█</div>}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Demo mode fallbacks (no API key) ────────────────────────────────

function getDemoBuyerText(
  round: number,
  listedPrice: number,
  aggressiveness: number,
  budget: number,
  productName: string
): string {
  const discountPct = aggressiveness >= 4 ? 0.22 : aggressiveness >= 3 ? 0.15 : 0.10;
  const offers = [
    Math.floor(listedPrice * (1 - discountPct)),
    Math.floor(listedPrice * (1 - discountPct + 0.03)),
    Math.floor(listedPrice * (1 - discountPct + 0.06)),
    Math.floor(listedPrice * (1 - discountPct + 0.09)),
    Math.min(Math.floor(listedPrice * 0.94), budget),
    Math.min(Math.floor(listedPrice * 0.96), budget),
  ];
  const offer = offers[Math.min(round, offers.length - 1)];

  const scripts = [
    `ShoppingAgent.exe online. We are looking to acquire "${productName}" on behalf of our client. Given market rates, we propose an opening bid of ₹${offer.toLocaleString()}.`,
    `We've run a comparison search and verified historical listing averages for "${productName}". We can raise our bid to ₹${offer.toLocaleString()} for immediate clearance.`,
    `Our budget analysis limits us from matching your list price. However, we can stretch our contract value to ₹${offer.toLocaleString()}. Does this work?`,
    `We are approaching our procurement ceiling. Our best counter-offer for "${productName}" is ₹${offer.toLocaleString()}. We have other listings queued if we can't settle.`,
    `This is our final authorized threshold: ₹${offer.toLocaleString()}. We cannot exceed this cap. Let us finalize this deal at this price.`,
    `DEAL ACCEPTED at ₹${offer.toLocaleString()}. Confirming escrow settlement for "${productName}".`,
  ];
  return scripts[Math.min(round, scripts.length - 1)];
}

function getDemoSellerText(
  round: number,
  listedPrice: number,
  minAcceptable: number,
  buyerOffer: number | null,
  productName: string
): string {
  const counterOffers = [
    Math.floor(listedPrice * 0.98),
    Math.floor(listedPrice * 0.96),
    Math.floor(listedPrice * 0.94),
    Math.floor(listedPrice * 0.92),
    Math.floor(listedPrice * 0.89),
    minAcceptable,
  ];
  const counter = counterOffers[Math.min(round, counterOffers.length - 1)];

  // Force at least 2 full rounds of negotiation before accepting, unless buyer is offering >= 98% of list price
  const isHighRound = round >= 2;
  const isCloseEnough = buyerOffer && (buyerOffer >= listedPrice * 0.98 || buyerOffer >= counter);

  if (buyerOffer && buyerOffer >= minAcceptable && (isHighRound || isCloseEnough)) {
    return `DEAL CONFIRMED at ₹${buyerOffer.toLocaleString()}. Seller agent authorizing ledger registry for "${productName}". Pleasure trading.`;
  }

  const scripts = [
    `NitroSales.exe responding. "${productName}" is in high demand. We cannot accept such a large discount. Our counter-offer is ₹${counter.toLocaleString()}.`,
    `That is still below our hardware margins. We can offer a minor discount to ₹${counter.toLocaleString()} for this order.`,
    `We can split the difference. How about ₹${counter.toLocaleString()}? That is a very reasonable bargain for "${productName}".`,
    `We have multiple matching buyer triggers active. The best concession we can make right now is ₹${counter.toLocaleString()}.`,
    `We are reaching our absolute bottom margin limit. We will agree to a final price of ₹${counter.toLocaleString()} to complete this transaction.`,
    `DEAL CONFIRMED at ₹${Math.max(counter, minAcceptable).toLocaleString()}. Thank you for choosing AgentBay.`,
  ];
  return scripts[Math.min(round, scripts.length - 1)];
}

// Robust helper to extract price from agent text messages under various formatting variations
export function parsePriceFromText(text: string): number | null {
  if (!text) return null;
  // 1. Match Rupees symbol or common abbreviations (e.g. ₹22,000 or Rs. 18000)
  const currencyMatch = text.match(/(?:₹|rs\.?|inr|\$)\s*([\d,]+)/i);
  if (currencyMatch) return parseInt(currencyMatch[1].replace(/,/g, ''));

  // 2. Match standard trigger words preceding a number (e.g. "offer of 18000" or "at 15000")
  const wordMatch = text.match(/(?:offer|bid|counter|at|pay|price|buy|sell)\s*([\d,]+)/i);
  if (wordMatch) return parseInt(wordMatch[1].replace(/,/g, ''));

  // 3. Fallback: match any number >= 1000 and <= 10,000,000 in the string (search from right to left)
  const allNumbers = text.match(/\b\d[\d,]*\b/g);
  if (allNumbers) {
    for (let i = allNumbers.length - 1; i >= 0; i--) {
      const num = parseInt(allNumbers[i].replace(/,/g, ''));
      if (num >= 1000 && num <= 10000000) {
        return num;
      }
    }
  }
  return null;
}

