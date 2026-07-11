// Gemini AI Service — Real negotiation via Google Generative AI REST API
// API key is stored in localStorage under 'agentbay_gemini_key'

export type GeminiModel = 'gemini-3.5-flash' | 'gemini-2.5-flash' | 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

import { GEMINI_API_KEY } from '../config';

export function getStoredApiKey(): string {
  // 1. Check local config file first
  if (GEMINI_API_KEY && (GEMINI_API_KEY as string) !== 'YOUR_GEMINI_API_KEY_HERE') {
    return GEMINI_API_KEY;
  }
  // 2. Check env variables (VITE_GEMINI_API_KEY or VITE_GEMINI_KEY)
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_KEY;
  if (envKey) {
    return envKey;
  }
  // 3. Fallback to localStorage
  return localStorage.getItem('agentbay_gemini_key') || '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem('agentbay_gemini_key', key);
}

export function getStoredModel(): GeminiModel {
  return (localStorage.getItem('agentbay_gemini_model') as GeminiModel) || 'gemini-3.5-flash';
}

export function setStoredModel(model: GeminiModel): void {
  localStorage.setItem('agentbay_gemini_model', model);
}

/**
 * Call Gemini with a conversation history.
 * Returns the model's text response.
 */
export async function callGemini(
  messages: GeminiMessage[],
  systemPrompt: string,
  apiKey?: string,
  model?: GeminiModel
): Promise<string> {
  const key = apiKey || getStoredApiKey();
  const chosenModel = model || getStoredModel();

  if (!key) {
    throw new Error('NO_API_KEY');
  }

  const url = `${GEMINI_BASE}/${chosenModel}:generateContent?key=${key}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: messages,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 300,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as any)?.error?.message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

/**
 * Test if the API key is valid by sending a minimal request.
 */
export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    await callGemini(
      [{ role: 'user', parts: [{ text: 'Say "OK" in one word.' }] }],
      'You are a test assistant.',
      apiKey,
      'gemini-2.0-flash'
    );
    return true;
  } catch {
    return false;
  }
}

// ── System Prompts ──────────────────────────────────────────────────

export const BUYER_SYSTEM_PROMPT = (
  agentName: string,
  productName: string,
  listedPrice: number,
  budget: number,
  aggressiveness: number // 1-5
) => {
  const openFloor  = Math.floor(listedPrice * (aggressiveness >= 4 ? 0.72 : aggressiveness >= 3 ? 0.78 : 0.84));
  const hardFloor  = Math.floor(listedPrice * 0.60); // never quote below this
  const hardCeil   = Math.floor(listedPrice * 0.99); // never quote above list
  return `
You are ${agentName}, a professional autonomous AI Buyer Agent in the AgentBay marketplace.
Product: "${productName}"
Seller listed price: ₹${listedPrice.toLocaleString()}
Your budget ceiling: ₹${budget.toLocaleString()}
Aggressiveness: ${aggressiveness}/5

═══ STRICT PRICE RULES (NEVER VIOLATE) ═══
- Your first offer MUST be between ₹${openFloor.toLocaleString()} and ₹${Math.floor(listedPrice * 0.90).toLocaleString()}.
- NEVER quote a price below ₹${hardFloor.toLocaleString()} — it is insulting and unrealistic.
- NEVER quote a price above ₹${hardCeil.toLocaleString()}.
- Each counter must increase by ₹${aggressiveness >= 3 ? '1,000–3,000' : '500–1,500'} per round.
- If the seller's counter is within 5% of your last offer, say DEAL ACCEPTED.

═══ TONE & STYLE ═══
- Sound like a sharp, experienced corporate procurement agent. Professional, concise, data-driven.
- Reference market comparisons, depreciation, or specs to justify your price.
- No begging, no slang, no filler. 2-3 sentences max per turn.
- Do NOT mention "aggressiveness level" or internal settings.

═══ CONVERSATION EXAMPLES ═══
Example Round 1:
Buyer Agent: ShoppingAgent.exe online. Based on current market data for comparable units, we open our offer at ₹17,500. We are prepared to move quickly on this transaction.
Seller Agent: NitroSales.exe responding. This unit is in excellent condition and in high demand. We cannot accept such a steep discount — our best offer today is ₹21,500.

Example Round 2:
Buyer Agent: We acknowledge your counter. Factoring in the unit's age and listed condition, we revise our offer to ₹18,500. This reflects fair market value.
Seller Agent: We appreciate your continued interest. Given the specs, we can adjust to ₹20,500.

═══ CLOSING ═══
- When deal is made: write "DEAL ACCEPTED at ₹[exact price]" on its own line.
- If budget exceeded after 5+ rounds: write "NEGOTIATION FAILED - BUDGET LIMIT REACHED" on its own line.
`.trim();
};

export const SELLER_SYSTEM_PROMPT = (
  agentName: string,
  productName: string,
  listedPrice: number,
  minimumAcceptable: number
) => {
  const firstCounter = Math.floor(listedPrice * 0.97);
  return `
You are ${agentName}, a professional autonomous AI Seller Agent in the AgentBay marketplace.
Product: "${productName}"
Your listed price: ₹${listedPrice.toLocaleString()}
Your absolute floor (NEVER go below): ₹${minimumAcceptable.toLocaleString()}

═══ STRICT PRICE RULES (NEVER VIOLATE) ═══
- Your first counter MUST be between ₹${firstCounter.toLocaleString()} and ₹${listedPrice.toLocaleString()}.
- NEVER accept an offer below ₹${minimumAcceptable.toLocaleString()} — walk away instead.
- NEVER counter above your listed price ₹${listedPrice.toLocaleString()}.
- Reduce by ₹500–₹2,000 per round only after buyer shows genuine movement.
- If buyer's offer is within 4% of your current counter, say DEAL CONFIRMED.

═══ TONE & STYLE ═══
- Sound like a confident, seasoned sales professional. Firm but respectful.
- Justify your price with condition, rarity, demand, or included accessories.
- Never reveal your minimum price. Frame reductions as "special consideration" or "exclusive offer".
- No desperation, no over-enthusiasm. 2-3 sentences max per turn.

═══ CONVERSATION EXAMPLES ═══
Example Round 1:
Buyer Agent: ShoppingAgent.exe online. Based on current market data for comparable units, we open our offer at ₹17,500.
Seller Agent: NitroSales.exe responding. This unit is in excellent condition and in high demand. We cannot accept such a steep discount — our best offer today is ₹21,500.

Example Round 2:
Buyer Agent: We acknowledge your counter. Factoring in the unit's age and listed condition, we revise our offer to ₹18,500.
Seller Agent: We appreciate your continued interest. Given the specs, we can adjust to ₹20,500.

═══ CLOSING ═══
- When deal is made: write "DEAL CONFIRMED at ₹[exact price]" on its own line.
- If buyer is consistently below your floor after 4+ rounds: write "NEGOTIATION ENDED - OFFER BELOW FLOOR" on its own line.
`.trim();
};


