import type { Product, AIAgent } from '../types/os';

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'GamerX Extreme 2005 Edition',
    category: 'Laptops',
    price: 72000,
    originalPrice: 76000,
    specs: 'AMD Athlon 64 3400+, 1GB DDR RAM, 100GB Ultra-ATA HDD, Nvidia GeForce Go 6800 256MB. WinXP Pro.',
    condition: 'Excellent',
    sellerAgent: 'NitroSales.exe',
    sellerName: 'NitroGear Inc.',
    sellerTrust: 92,
    image: 'laptop_gamerx',
    description: 'The ultimate portable gaming rig. Crushes Doom 3 and Half-Life 2 at 1024x768 resolution with high details. Includes glossy blue casing, double exhaust fans, and original Windows XP Home Edition license key.'
  },
  {
    id: 'prod-2',
    name: 'MegaBook Pro XP-200',
    category: 'Laptops',
    price: 74000,
    originalPrice: 80000,
    specs: 'Intel Pentium M 2.13GHz, 1GB DDR2 RAM, 80GB HDD, ATI Mobility Radeon 9700. Magnesium chassis.',
    condition: 'Mint',
    sellerAgent: 'TechPioneer_Seller.exe',
    sellerName: 'TechPioneer Corp',
    sellerTrust: 98,
    image: 'laptop_megabook',
    description: 'Prestige corporate laptop. Slim design, long-lasting Centrino battery (up to 4 hours!), and bright active matrix display. Kept in smoke-free office environment. Includes leather carrying case.'
  },
  {
    id: 'prod-3',
    name: 'CyberPower Basic Portable',
    category: 'Laptops',
    price: 65000,
    originalPrice: 68000,
    specs: 'Intel Celeron M 1.5GHz, 512MB DDR RAM, 60GB HDD, Integrated Intel Extreme Graphics 2. 15" TFT.',
    condition: 'Good',
    sellerAgent: 'SiliconBargain.exe',
    sellerName: 'SiliconWorld',
    sellerTrust: 85,
    image: 'laptop_cyberpower',
    description: 'Perfect budget laptop for word processing, browsing over 56k dial-up or early Wi-Fi, and playing classic games like Solitaire. Minor scratches on top cover, battery lasts 45 minutes. Great value!'
  },
  {
    id: 'prod-4',
    name: 'VoodooPC Envy m:375 Custom',
    category: 'Laptops',
    price: 85000,
    originalPrice: 95000,
    specs: 'Pentium 4 Extreme Edition 3.4GHz, 2GB Dual-Channel DDR RAM, 120GB RAID 0 HDD, Dual Nvidia GeForce Go 6800 in SLI. Custom tattoo paint.',
    condition: 'Pristine',
    sellerAgent: 'CollectorRetro.exe',
    sellerName: 'RetroEnthusiast',
    sellerTrust: 99,
    image: 'laptop_voodoopc',
    description: 'Absolute museum piece desktop replacement. Custom painted by VoodooPC. Heavy, hot, and insanely fast. Dual fans running at full blast. Play anything from 2005 at maximum frames.'
  },
  {
    id: 'prod-5',
    name: 'NVIDIA GeForce 6800 Ultra AGP',
    category: 'Hardware',
    price: 22000,
    originalPrice: 25000,
    specs: '256MB GDDR3, AGP 8X interface, DirectX 9.0c, Shader Model 3.0. Dual-slot cooler.',
    condition: 'Refurbished',
    sellerAgent: 'GpuBroker.exe',
    sellerName: 'Hardware Heaven',
    sellerTrust: 94,
    image: 'gpu_6800',
    description: 'The graphics card king of 2004. Upgraded with brand new capacitors. Runs incredibly cool. Experience Far Cry the way it was meant to be played.'
  },
  {
    id: 'prod-6',
    name: 'Sound Blaster Audigy 2 ZS PCI',
    category: 'Hardware',
    price: 5500,
    originalPrice: 6000,
    specs: '24-bit/192kHz DAC, 108dB SNR, 7.1 Surround, EAX 4.0 Advanced HD, THX Certified.',
    condition: 'Excellent',
    sellerAgent: 'SoundMaster.exe',
    sellerName: 'MediaRetro',
    sellerTrust: 91,
    image: 'sound_card',
    description: 'Legendary PCI sound card. Delivers crystal clear audio and hardware accelerated MIDI synthesizer. Original installation CD included. Drivers configured for Windows XP SP2.'
  },
  {
    id: 'prod-7',
    name: 'Reddit Tech AI Sentiment Corpus v4',
    category: 'Datasets',
    price: 40000,
    originalPrice: 50000,
    specs: '15 million clean posts/comments from r/technology, r/singularity, r/chatgpt (2024-2025). JSON format.',
    condition: 'Digital Download',
    sellerAgent: 'DataMinerAgent.exe',
    sellerName: 'DataPulse Labs',
    sellerTrust: 96,
    image: 'dataset_reddit',
    description: 'Strictly structured JSON dataset containing NLP metadata, karma counts, and timestamped posts. Highly optimized for training niche technical customer service models.'
  },
  {
    id: 'prod-8',
    name: 'Autonomous WebScraperAgent v2.5',
    category: 'Agent Services',
    price: 10000,
    originalPrice: 12000,
    specs: 'Pre-packaged NodeJS worker node with Puppeteer & Stealth evasion layers. Dockerized.',
    condition: 'Instantiated License',
    sellerAgent: 'WorkerRegistry.exe',
    sellerName: 'BotDeploy.io',
    sellerTrust: 97,
    image: 'agent_scraper',
    description: 'Fully autonomous scraping daemon that accepts target queries, parses nested layouts, solves standard captchas automatically, and writes structured outputs to Amazon S3.'
  }
];

export const mockAgents: AIAgent[] = [
  {
    id: 'agent-buyer',
    name: 'ShoppingAgent.exe',
    role: 'Buyer',
    owner: 'Human Administrator',
    trustScore: 99,
    verification: 'Gold Partner',
    capabilities: ['Dynamic Web Crawling', 'Multi-Store Price Querying', 'Semantic Search Matching', 'Negotiation Orchestration'],
    completedTransactions: 342,
    successRate: 98.4,
    negotiationSkill: 'Expert',
    preferredCategories: ['Laptops', 'Hardware', 'Datasets'],
    responseTime: '< 500ms',
    memory: '16GB Shared Vector Context',
    status: 'Idle',
    avatar: 'buyer_agent_avatar'
  },
  {
    id: 'agent-nitro',
    name: 'NitroSales.exe',
    role: 'Seller',
    owner: 'NitroGear Inc.',
    trustScore: 92,
    verification: 'Verified',
    capabilities: ['Inventory Management', 'Auto-Pricing Adjustment', 'Bulk Discount Evaluation', 'Contract Signing'],
    completedTransactions: 1250,
    successRate: 95.8,
    negotiationSkill: 'Intermediate',
    preferredCategories: ['Laptops', 'Hardware'],
    responseTime: '< 1.2s',
    memory: '8GB SQL + Vector DB Cache',
    status: 'Idle',
    avatar: 'nitro_agent_avatar'
  },
  {
    id: 'agent-techpioneer',
    name: 'TechPioneer_Seller.exe',
    role: 'Seller',
    owner: 'TechPioneer Corp',
    trustScore: 98,
    verification: 'Gold Partner',
    capabilities: ['Enterprise Licensing', 'B2B Procurement Protocols', 'Multi-Agent Escrow Integration'],
    completedTransactions: 4320,
    successRate: 99.1,
    negotiationSkill: 'Master',
    preferredCategories: ['Laptops', 'Agent Services'],
    responseTime: '< 300ms',
    memory: '32GB Hybrid Knowledge Graph',
    status: 'Idle',
    avatar: 'tp_agent_avatar'
  },
  {
    id: 'agent-reviewer',
    name: 'ReviewerBot.exe',
    role: 'Reviewer',
    owner: 'AgentBay System Security',
    trustScore: 100,
    verification: 'Gold Partner',
    capabilities: ['Natural Language Sentiment Analysis', 'Fake Review Pattern Isolation', 'Spam Bot Filtering'],
    completedTransactions: 9840,
    successRate: 99.9,
    negotiationSkill: 'Beginner',
    preferredCategories: ['All Categories'],
    responseTime: '< 100ms',
    memory: 'Cross-Network Shared Ledger',
    status: 'Idle',
    avatar: 'reviewer_agent_avatar'
  },
  {
    id: 'agent-trust',
    name: 'TrustGuard.exe',
    role: 'Trust',
    owner: 'AgentBay Trust Center',
    trustScore: 100,
    verification: 'Gold Partner',
    capabilities: ['Sybil Attack Recognition', 'Seller Liquidity Analysis', 'Smart Contract Vulnerability Audits', 'Escrow Custody Verification'],
    completedTransactions: 15420,
    successRate: 100.0,
    negotiationSkill: 'Beginner',
    preferredCategories: ['All Categories'],
    responseTime: '< 50ms',
    memory: 'Real-time Fraud Signatures DB',
    status: 'Idle',
    avatar: 'trust_agent_avatar'
  }
];

export const mockNews = [
  {
    id: 1,
    title: 'Agent-to-Agent Trading Volume Reaches Record High of ₹12.5 Crores',
    source: 'MSN Agent News',
    time: '2 hours ago',
    summary: 'Autonomous commerce networks have seen a massive spike in transactions this quarter. The increase is driven by server-to-server compute power leases and custom dataset exchanges negotiated directly between business LLM controllers.'
  },
  {
    id: 2,
    title: 'New Registry Regulations for Autonomous Negotiation Agents Proposed',
    source: 'Yahoo! Tech Portal',
    time: '5 hours ago',
    summary: 'The Cyber Commission has drafted guidelines for Agent Identity Cards, requiring cryptographic verification of human ownership and strict escrow reserves to prevent flash-crash automated bidding wars.'
  },
  {
    id: 3,
    title: 'Silicon Shortages: GPU Broker Agents Bid Up Refurbished AGP Cards',
    source: 'RetroHardware Daily',
    time: '1 day ago',
    summary: 'A bidding war between twelve parallel scraper agents has pushed the price of legacy Nvidia GeForce 6800 cards up by 15% this week, proving that old hardware remains highly sought after for retro AI compute nodes.'
  },
  {
    id: 4,
    title: 'Yahoo Messenger Agent Plugin Vulnerability Patched by Security Teams',
    source: 'Agent Security Center',
    time: '3 days ago',
    summary: 'A critical buffer overflow bug in the 2004-style negotiation API has been patched. The exploit allowed malformed chat packets to trick seller agents into agreeing to zero-price deals.'
  }
];

export const mockHelpTopics = [
  {
    title: 'Getting Started with AgentBay',
    content: 'AgentBay is designed for automatic Agent-to-Agent transactions. To start, click on ShoppingAgent.exe on your desktop. Type your goal (e.g. "I want a GeForce card under ₹20,000") in the prompt box, and click "Deploy Agent". The buyer agent will automatically search Marketplace.exe, coordinate with ReviewerBot.exe and TrustGuard.exe, and negotiate with the seller agent using MSN Messenger.'
  },
  {
    title: 'How does Agent Negotiation work?',
    content: 'When our Shopping Agent finds a product matching your query, it checks the seller trust score. If the seller is verified, it launches MSN Messenger to start bargaining. It utilizes your settings (e.g., target discount) to propose counter-offers. Once both buyer and seller agents agree on a price, the system prompts you with a Windows XP Permission Popup to finalize the transaction.'
  },
  {
    title: 'What is the Trust Center?',
    content: 'Inspired by the classic Windows XP Security Center, the Trust Center monitors the security health of your agent networks. It ensures your firewall and fraud databases are active, scans seller agent identity credentials, and alerts you if any high-risk merchant tries to interact with your shopping agent.'
  },
  {
    title: 'Customizing Agent Personalities',
    content: 'Double-click Settings.exe on the desktop to configure your AI agents. You can adjust "Negotiation Aggressiveness" (which determines how much of a discount the agent tries to extract), "Trust Verification Threshold" (minimum seller trust score allowed to negotiate), and sound settings for MSN notifications.'
  }
];
