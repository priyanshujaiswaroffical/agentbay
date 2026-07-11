import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Desktop } from './components/Desktop';
import { WindowFrame } from './components/WindowFrame';
import { XPNotification } from './components/XPNotification';
import { LoginScreen, type UserProfile, getStoredUser, storeCurrentUser } from './components/LoginScreen';
import type { WindowState, AppId, Transaction, Message, Product } from './types/os';
import { mockProducts } from './data/mockData';
import {
  playLoginSound, playLogoutSound, playNotificationSound,
  playNudgeSound, playSuccessSound, playErrorSound,
  setSoundEnabled,
} from './services/soundService';

// Apps
import { MarketplaceApp } from './apps/MarketplaceApp';
import { ShoppingAgentApp } from './apps/ShoppingAgentApp';
import { NegotiationMessengerApp } from './apps/NegotiationMessengerApp';
import { AIAgentsApp } from './apps/AIAgentsApp';
import { TrustCenterApp } from './apps/TrustCenterApp';
import { TransactionsApp } from './apps/TransactionsApp';
import { SmartReceiptApp } from './apps/SmartReceiptApp';
import { AnalyticsApp } from './apps/AnalyticsApp';
import { SettingsApp } from './apps/SettingsApp';
import { AgentNewsApp } from './apps/AgentNewsApp';
import { HelpApp } from './apps/HelpApp';
import { AboutApp } from './apps/AboutApp';
import {
  supabaseGetProducts, supabaseAddProduct, supabaseDeleteProduct,
  supabaseGetTransactions, supabaseAddTransaction, supabaseSignOut
} from './services/supabaseService';

// ── Window Defaults ───────────────────────────────────────────────
const DEFAULT_WINDOWS: WindowState[] = [
  { id: 'marketplace',   title: 'Marketplace.exe — Internet Explorer', isOpen: false, isMinimized: false, isMaximized: false, x: 40,  y: 30,  width: 850, height: 620, zIndex: 10 },
  { id: 'shoppingAgent', title: 'ShoppingAgent.exe',                   isOpen: false, isMinimized: false, isMaximized: false, x: 90,  y: 50,  width: 780, height: 640, zIndex: 5  },
  { id: 'messenger',     title: 'Negotiation Messenger — MSN',         isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 80,  width: 700, height: 560, zIndex: 5  },
  { id: 'agents',        title: 'AI Agents.exe — Directory',           isOpen: false, isMinimized: false, isMaximized: false, x: 80,  y: 60,  width: 740, height: 510, zIndex: 5  },
  { id: 'trustCenter',   title: 'Trust Center.exe — Security',         isOpen: false, isMinimized: false, isMaximized: false, x: 120, y: 100, width: 740, height: 540, zIndex: 5  },
  { id: 'transactions',  title: 'Transactions Registry',               isOpen: false, isMinimized: false, isMaximized: false, x: 160, y: 120, width: 800, height: 490, zIndex: 5  },
  { id: 'receipt',       title: 'Smart Receipt.exe',                   isOpen: false, isMinimized: false, isMaximized: false, x: 200, y: 80,  width: 400, height: 560, zIndex: 5  },
  { id: 'analytics',     title: 'Diagnostics & Analytics',             isOpen: false, isMinimized: false, isMaximized: false, x: 80,  y: 140, width: 720, height: 520, zIndex: 5  },
  { id: 'settings',      title: 'Control Panel — Settings',            isOpen: false, isMinimized: false, isMaximized: false, x: 180, y: 80,  width: 640, height: 540, zIndex: 5  },
  { id: 'news',          title: 'Agent News.exe',                      isOpen: false, isMinimized: false, isMaximized: false, x: 70,  y: 90,  width: 760, height: 540, zIndex: 5  },
  { id: 'help',          title: 'Help and Support Center',             isOpen: false, isMinimized: false, isMaximized: false, x: 240, y: 180, width: 700, height: 520, zIndex: 5  },
  { id: 'about',         title: 'About AgentBay',                      isOpen: false, isMinimized: false, isMaximized: false, x: 300, y: 200, width: 480, height: 360, zIndex: 5  },
];

// ── Window Helper ─────────────────────────────────────────────────
function getWin(windows: WindowState[], id: AppId) {
  return windows.find(w => w.id === id)!;
}

function WF({
  id, icon, title, windows, activeWindowId,
  onFocus, onClose, onMinimize, onMaximize, onMove, onResize,
  shake, children,
}: {
  id: AppId; icon: string; title?: string; windows: WindowState[]; activeWindowId: AppId | null;
  onFocus: () => void; onClose: () => void; onMinimize: () => void;
  onMaximize: () => void; onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void; shake?: boolean;
  children: React.ReactNode;
}) {
  const w = getWin(windows, id);
  if (!w?.isOpen) return null;
  return (
    <WindowFrame
      id={id} title={title || w.title}
      isOpen={w.isOpen} isMinimized={w.isMinimized} isMaximized={w.isMaximized}
      x={w.x} y={w.y} width={w.width} height={w.height} zIndex={w.zIndex}
      active={activeWindowId === id} shake={shake}
      icon={<span className="text-[11px]">{icon}</span>}
      onFocus={onFocus} onClose={onClose} onMinimize={onMinimize}
      onMaximize={onMaximize} onMove={onMove} onResize={onResize}
    >
      {/* Only render children when not minimized for performance */}
      {!w.isMinimized && children}
    </WindowFrame>
  );
}

// ── App ───────────────────────────────────────────────────────────
export const App: React.FC = () => {
  // Auth
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser);

  // Windows
  const [windows, setWindows] = useState<WindowState[]>(DEFAULT_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<AppId | null>(null);
  const zIdx = useRef(20);
  const humanMsgHandlerRef = useRef<((msg: string) => void) | null>(null);

  // Settings
  const [controlSettings, setControlSettings] = useState({
    negotiationAggressiveness: 3,
    minTrustScore: 75,
    autoBuyLimit: 80000,
    soundEnabled: true,
    verificationRequired: true,
  });

  // Products list state
  const [products, setProducts] = useState<Product[]>(mockProducts);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'success' }[]>([]);

  // Commerce state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  // Messenger state
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [currentBargainPrice, setCurrentBargainPrice] = useState<number | undefined>();
  const [typingState, setTypingState] = useState<'idle' | 'buyer_typing' | 'seller_typing'>('idle');
  const [shakeWindow, setShakeWindow] = useState(false);

  // Agent prompt linking
  const [shoppingAgentPrompt, setShoppingAgentPrompt] = useState('');

  const syncData = useCallback(async (user: UserProfile) => {
    try {
      let dbProds = await supabaseGetProducts();
      
      // If Supabase is empty, seed mock products so they get proper UUIDs
      if (dbProds.length === 0) {
        for (const p of mockProducts) {
          try { await supabaseAddProduct(p, user.id); } catch {}
        }
        dbProds = await supabaseGetProducts();
      }
      
      setProducts(dbProds);
      
      const dbTx = await supabaseGetTransactions(user.id, user.role);
      setTransactions(dbTx);
    } catch (e) {
      console.error('Database sync failed:', e);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      syncData(currentUser);
    }
  }, [currentUser, syncData]);

  // ── Window Ops ──
  const handleOpenApp = useCallback((appId: AppId) => {
    zIdx.current += 1;
    setWindows(prev => prev.map(w =>
      w.id === appId ? { ...w, isOpen: true, isMinimized: false, zIndex: zIdx.current } : w
    ));
    setActiveWindowId(appId);
  }, []);

  const handleCloseApp = useCallback((appId: AppId) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isOpen: false } : w));
    setActiveWindowId(prev => prev === appId ? null : prev);
  }, []);

  const handleMinimizeApp = useCallback((appId: AppId) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
  }, []);

  const handleRestoreApp = useCallback((appId: AppId) => {
    zIdx.current += 1;
    setWindows(prev => prev.map(w =>
      w.id === appId ? { ...w, isMinimized: false, zIndex: zIdx.current } : w
    ));
    setActiveWindowId(appId);
  }, []);

  const handleMaximizeApp = useCallback((appId: AppId) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const handleFocusApp = useCallback((appId: AppId) => {
    zIdx.current += 1;
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, zIndex: zIdx.current } : w));
    setActiveWindowId(appId);
  }, []);

  const handleMoveApp = useCallback((appId: AppId, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, x, y } : w));
  }, []);

  const handleResizeApp = useCallback((appId: AppId, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, width, height } : w));
  }, []);

  // ── Notification ──
  const triggerNotification = useCallback((title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    playNotificationSound();
  }, []);

  // ── Agent linking ──
  const handleDeployAgentForProduct = useCallback((productName: string, targetPrice: number) => {
    setShoppingAgentPrompt(`I need a ${productName} under ₹${targetPrice.toLocaleString()}.`);
    handleOpenApp('shoppingAgent');
  }, [handleOpenApp]);

  // ── Negotiation sync ──
  const handleStartNegotiation = useCallback((chat: Message[], price: number) => {
    setChatHistory(chat);
    setCurrentBargainPrice(price);
    setIsNegotiating(true);
    setTypingState('buyer_typing');
  }, []);

  const handleUpdateNegotiation = useCallback((
    chat: Message[] | ((prev: Message[]) => Message[]),
    price: number,
    typing: 'idle' | 'buyer_typing' | 'seller_typing'
  ) => {
    setChatHistory(chat as any);
    if (price > 0) setCurrentBargainPrice(price);
    setTypingState(typing);
  }, []);

  const handleFinishNegotiation = useCallback(async (tx: Transaction) => {
    setSelectedReceipt(tx);
    setIsNegotiating(false);
    setTypingState('idle');
    
    // Play sound based on whether deal was made (savings > 0 means success)
    if (tx.savings >= 0 && tx.finalPrice > 0) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    if (currentUser) {
      try {
        await supabaseAddTransaction(tx, currentUser.id);
        syncData(currentUser);
      } catch (e: any) {
        triggerNotification('System Ledger', `Transaction backup failed: ${e.message}`, 'warning');
      }
    }
  }, [currentUser, syncData, triggerNotification]);

  const handleSendHumanMessage = useCallback((text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'Human',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory(prev => [...prev, msg]);
    // Inject into active buyer AI negotiation
    if (humanMsgHandlerRef.current) {
      humanMsgHandlerRef.current(text);
    }
  }, []);

  const handleNudge = useCallback(() => {
    setShakeWindow(true);
    setTimeout(() => setShakeWindow(false), 600);
    triggerNotification('MSN Messenger', '🔔 You sent a nudge!', 'info');
    playNudgeSound();
  }, [triggerNotification]);

  const handleAddProduct = useCallback(async (prod: Product) => {
    if (currentUser) {
      try {
        await supabaseAddProduct(prod, currentUser.id);
        triggerNotification('Marketplace.exe', `New listing published: ${prod.name}`, 'success');
        syncData(currentUser);
      } catch (e: any) {
        triggerNotification('Marketplace.exe', `Listing upload failed: ${e.message}`, 'warning');
      }
    }
  }, [currentUser, syncData, triggerNotification]);

  const handleDeleteProduct = useCallback(async (prodId: string) => {
    try {
      await supabaseDeleteProduct(prodId);
      triggerNotification('Marketplace.exe', 'Product listing deleted successfully.', 'info');
      if (currentUser) syncData(currentUser);
    } catch (e: any) {
      triggerNotification('Marketplace.exe', `Delete failed: ${e.message}`, 'warning');
    }
  }, [currentUser, syncData, triggerNotification]);

  // ── Auth ──
  const handleLogin = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    storeCurrentUser(user);
    playLoginSound();
    // Sync sound enabled setting
    setSoundEnabled(true);
    // Open marketplace by default after login
    setTimeout(() => handleOpenApp('marketplace'), 100);
  }, [handleOpenApp]);

  const handleLogout = useCallback(() => {
    playLogoutSound();
    setTimeout(async () => {
      await supabaseSignOut();
      setCurrentUser(null);
      storeCurrentUser(null);
      setWindows(DEFAULT_WINDOWS);
      setActiveWindowId(null);
      setChatHistory([]);
      setIsNegotiating(false);
    }, 600); // small delay so logout sound plays before unmount
  }, []);

  // ── Shared WindowFrame helpers ──
  const wfProps = useMemo(() => (id: AppId) => ({
    onFocus: () => handleFocusApp(id),
    onClose: () => handleCloseApp(id),
    onMinimize: () => handleMinimizeApp(id),
    onMaximize: () => handleMaximizeApp(id),
    onMove: (x: number, y: number) => handleMoveApp(id, x, y),
    onResize: (w: number, h: number) => handleResizeApp(id, w, h),
  }), [handleFocusApp, handleCloseApp, handleMinimizeApp, handleMaximizeApp, handleMoveApp, handleResizeApp]);

  // ── Show login if not logged in ──
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Desktop
      windows={windows}
      onOpenApp={handleOpenApp}
      onMinimizeApp={handleMinimizeApp}
      onRestoreApp={handleRestoreApp}
      activeWindowId={activeWindowId}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {/* 1. Marketplace.exe */}
      <WF id="marketplace" icon="🌐" windows={windows} activeWindowId={activeWindowId} {...wfProps('marketplace')}>
        <MarketplaceApp
          onDeployAgentForProduct={handleDeployAgentForProduct}
          currentUser={currentUser}
          products={products}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </WF>

      {/* 2. ShoppingAgent.exe */}
      <WF id="shoppingAgent" icon="🤖" windows={windows} activeWindowId={activeWindowId} {...wfProps('shoppingAgent')}>
        <ShoppingAgentApp
          products={products}
          onStartNegotiation={handleStartNegotiation}
          onUpdateNegotiation={handleUpdateNegotiation}
          onFinishNegotiation={handleFinishNegotiation}
          onShowNotification={triggerNotification}
          onOpenApp={handleOpenApp}
          initialPrompt={shoppingAgentPrompt}
          onClearInitialPrompt={() => setShoppingAgentPrompt('')}
          onRegisterHumanMsgHandler={(handler) => { humanMsgHandlerRef.current = handler; }}
          controlSettings={controlSettings}
        />
      </WF>

      {/* 3. Negotiation Messenger */}
      <WF id="messenger" icon="💬" windows={windows} activeWindowId={activeWindowId} shake={shakeWindow} {...wfProps('messenger')}>
        <NegotiationMessengerApp
          chatHistory={chatHistory}
          isNegotiating={isNegotiating}
          typingState={typingState}
          currentBargainPrice={currentBargainPrice}
          onSendHumanMessage={handleSendHumanMessage}
          onNudge={handleNudge}
        />
      </WF>

      {/* 4. AI Agents.exe */}
      <WF id="agents" icon="👥" windows={windows} activeWindowId={activeWindowId} {...wfProps('agents')}>
        <AIAgentsApp />
      </WF>

      {/* 5. Trust Center.exe */}
      <WF id="trustCenter" icon="🛡️" windows={windows} activeWindowId={activeWindowId} {...wfProps('trustCenter')}>
        <TrustCenterApp
          score={98}
          riskLevel="Low"
          fraudDetectionDetails={[
            'Handshake signature verified (SHA-256)',
            'Escrow liquidity check passed (100% covered)',
            'IP address matching merchant node credentials',
            'No spam-bot double-bidding patterns detected',
          ]}
          securityStatus="All security controls are ACTIVE. Your agents are operating in a secure sandbox."
        />
      </WF>

      {/* 6. Transactions.exe */}
      <WF id="transactions" icon="📁" windows={windows} activeWindowId={activeWindowId} {...wfProps('transactions')}>
        <TransactionsApp
          transactions={transactions}
          currentUser={currentUser}
          onSelectReceipt={tx => { setSelectedReceipt(tx); handleOpenApp('receipt'); }}
        />
      </WF>

      {/* 7. Smart Receipt.exe */}
      <div data-print-receipt>
        <WF id="receipt" icon="🧾" windows={windows} activeWindowId={activeWindowId} {...wfProps('receipt')}>
          <SmartReceiptApp selectedTransaction={selectedReceipt} currentUser={currentUser} />
        </WF>
      </div>

      {/* 8. Analytics.exe */}
      <WF id="analytics" icon="📊" windows={windows} activeWindowId={activeWindowId} {...wfProps('analytics')}>
        <AnalyticsApp />
      </WF>

      {/* 9. Settings.exe */}
      <WF id="settings" icon="⚙️" windows={windows} activeWindowId={activeWindowId} {...wfProps('settings')}>
        <SettingsApp
          controlSettings={controlSettings}
          onUpdateSettings={updates => setControlSettings(prev => ({ ...prev, ...updates }))}
          currentUser={currentUser}
          onShowNotification={triggerNotification}
        />
      </WF>

      {/* 10. Agent News.exe */}
      <WF id="news" icon="📰" windows={windows} activeWindowId={activeWindowId} {...wfProps('news')}>
        <AgentNewsApp />
      </WF>

      {/* 11. Help.exe */}
      <WF id="help" icon="❓" windows={windows} activeWindowId={activeWindowId} {...wfProps('help')}>
        <HelpApp />
      </WF>

      {/* 12. About.exe */}
      <WF id="about" icon="ℹ️" windows={windows} activeWindowId={activeWindowId} {...wfProps('about')}>
        <AboutApp />
      </WF>

      {/* XP Tray Notifications */}
      {notifications.map(n => (
        <XPNotification
          key={n.id} id={n.id} title={n.title} message={n.message} type={n.type}
          onClose={id => setNotifications(prev => prev.filter(x => x.id !== id))}
        />
      ))}
    </Desktop>
  );
};
