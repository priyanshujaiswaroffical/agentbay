export type AppId =
  | 'marketplace'
  | 'shoppingAgent'
  | 'messenger'
  | 'agents'
  | 'trustCenter'
  | 'transactions'
  | 'receipt'
  | 'analytics'
  | 'settings'
  | 'news'
  | 'help'
  | 'about';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in INR
  originalPrice: number;
  specs: string;
  condition: string;
  sellerAgent: string;
  sellerName: string;
  sellerTrust: number; // 0-100
  description: string;
  image: string;
  minAcceptablePrice?: number;
}




export interface AIAgent {
  id: string;
  name: string;
  role: 'Buyer' | 'Seller' | 'Reviewer' | 'Trust' | 'Negotiator';
  owner: string;
  trustScore: number;
  verification: 'Verified' | 'Unverified' | 'Gold Partner';
  capabilities: string[];
  completedTransactions: number;
  successRate: number;
  negotiationSkill: 'Beginner' | 'Intermediate' | 'Expert' | 'Master';
  preferredCategories: string[];
  responseTime: string;
  memory: string;
  status: 'Idle' | 'Searching' | 'Negotiating' | 'Verifying' | 'Awaiting Permission' | 'Completed';
  avatar: string;
}

export interface Message {
  id: string;
  sender: 'BuyerAgent' | 'SellerAgent' | 'System' | 'Human';
  text: string;
  timestamp: string;
  price?: number;
  isOffer?: boolean;
  offerAmount?: number;
}

export interface NegotiationHistory {
  productId: string;
  productName: string;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  messages: Message[];
  status: 'Pending' | 'Success' | 'Failed';
}

export interface Transaction {
  id: string;
  timestamp: string;
  productName: string;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  buyerAgent: string;
  sellerAgent: string;
  status?: 'Completed' | 'Refunded';
  receiptId: string;
  negotiationTimeline: string[];
}

export interface TrustReport {
  score: number;
  sellerReputation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  fraudDetectionDetails: string[];
  securityStatus: string;
  confidenceMeter: number;
}
