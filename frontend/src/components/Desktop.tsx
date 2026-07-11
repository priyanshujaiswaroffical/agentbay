import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ShoppingCart, MessageSquare, Shield, Activity, Settings, Newspaper, Clock, Volume2, Wifi, Battery, Folder, Receipt, Bot } from 'lucide-react';
import type { WindowState, AppId } from '../types/os';
import { StartMenu } from './StartMenu';
import type { UserProfile } from './LoginScreen';

interface DesktopProps {
  windows: WindowState[];
  onOpenApp: (appId: AppId) => void;
  onMinimizeApp: (appId: AppId) => void;
  onRestoreApp: (appId: AppId) => void;
  activeWindowId: AppId | null;
  currentUser: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
}

// ── Floating Bubble Config ──────────────────────────────────────────
interface BubbleConfig {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface WindStreakConfig {
  id: number;
  top: number;
  width: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateBubbles(count: number): BubbleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 18 + Math.random() * 90,
    left: 2 + Math.random() * 94,
    duration: 14 + Math.random() * 22,
    delay: Math.random() * 18,
    opacity: 0.15 + Math.random() * 0.45,
  }));
}

function generateStreaks(count: number): WindStreakConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 5 + Math.random() * 85,
    width: 80 + Math.random() * 200,
    duration: 8 + Math.random() * 14,
    delay: Math.random() * 12,
    opacity: 0.15 + Math.random() * 0.35,
  }));
}

// Stable configs — generated once
const BUBBLES = generateBubbles(14);
const STREAKS = generateStreaks(8);

// ── Shutdown Overlay ────────────────────────────────────────────────
const ShutdownOverlay: React.FC<{ mode: 'logoff' | 'shutdown'; onDone: () => void }> = ({ mode, onDone }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(t);
          setTimeout(() => {
            if (mode === 'shutdown') {
              window.close();
            }
            onDone();
          }, 800);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, onDone]);

  return (
    <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center select-none"
      style={{
        background: mode === 'shutdown'
          ? 'radial-gradient(circle, #001a3a 0%, #000510 100%)'
          : 'linear-gradient(135deg, #1a1a2e, #0f3460)',
      }}
    >
      <div className="text-center text-white">
        <div className="text-6xl mb-6">{mode === 'shutdown' ? '💻' : '👤'}</div>
        <h2 className="text-2xl font-bold tracking-widest mb-3">
          {mode === 'shutdown' ? 'Shutting Down AgentBay OS...' : 'Logging Off...'}
        </h2>
        <p className="text-[#90d0ff] text-sm mb-6">
          {mode === 'shutdown'
            ? 'Please wait while the system safely powers down autonomous agents.'
            : 'Saving session and clearing agent context...'}
        </p>

        {/* XP-style progress bar */}
        <div className="w-64 mx-auto">
          <div className="xp-loader">
            <div className="xp-loader-bar">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="xp-loader-block flex-1"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
          <p className="text-[#90d0ff] text-xs mt-3 font-mono">
            {count > 0 ? `Completing in ${count}...` : 'Done.'}
          </p>
        </div>

        {mode === 'shutdown' && (
          <p className="text-gray-500 text-[10px] mt-8 max-w-xs mx-auto">
            AgentBay OS — Autonomous Commerce Network. All agent sessions have been terminated.
          </p>
        )}
      </div>
    </div>
  );
};

// ── Date/Time Popup (Windows XP Date/Time Properties Panel) ─────────
const DateTimePopup: React.FC<{
  onClose: () => void;
  timeOffset: number;
  onSetOffset: (offset: number) => void;
}> = ({ onClose, timeOffset, onSetOffset }) => {
  const currentSimulatedTime = useMemo(() => new Date(Date.now() + timeOffset), [timeOffset]);

  const [year, setYear] = useState(currentSimulatedTime.getFullYear());
  const [month, setMonth] = useState(currentSimulatedTime.getMonth()); // 0-11
  const [day, setDay] = useState(currentSimulatedTime.getDate());
  const [hours, setHours] = useState(currentSimulatedTime.getHours());
  const [minutes, setMinutes] = useState(currentSimulatedTime.getMinutes());
  const [seconds, setSeconds] = useState(currentSimulatedTime.getSeconds());

  // Generate calendar days
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const calendarGrid = useMemo(() => {
    const grid: (number | null)[] = [];
    // Pad first week prefix empty days
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(d);
    }
    return grid;
  }, [daysInMonth, firstDayOfWeek]);

  const handleApply = () => {
    const target = new Date(year, month, day, hours, minutes, seconds);
    const newOffset = target.getTime() - Date.now();
    onSetOffset(newOffset);
    onClose();
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="absolute bottom-[44px] right-2 z-[999998] w-[310px] bg-[#ece9d8] border border-gray-500 shadow-2xl font-sans"
      style={{ boxShadow: '4px 4px 12px rgba(0,0,0,0.5)', borderRight: '2px solid #555', borderBottom: '2px solid #555' }}
    >
      {/* Title bar */}
      <div className="xp-titlebar px-2.5 py-1.5 flex items-center justify-between text-xs select-none">
        <span className="font-bold">Date and Time Properties</span>
        <button onClick={onClose} className="xp-titlebar-btn xp-titlebar-btn-close w-4 h-4 text-[8px] flex items-center justify-center font-bold">✕</button>
      </div>

      <div className="p-3 flex flex-col gap-3.5 text-black">
        {/* Month and Year Selectors */}
        <div className="flex gap-2 justify-between">
          {/* Month Select */}
          <select
            className="xp-input py-0.5 px-1.5 flex-1 text-xs bg-white border border-gray-400"
            value={month}
            onChange={e => {
              const m = Number(e.target.value);
              setMonth(m);
              // clamp day if out of range for next month
              const days = new Date(year, m + 1, 0).getDate();
              if (day > days) setDay(days);
            }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>{name}</option>
            ))}
          </select>

          {/* Year spinner */}
          <input
            type="number"
            className="xp-input py-0.5 px-1 w-20 text-xs text-center border border-gray-400"
            value={year}
            onChange={e => {
              const y = Number(e.target.value);
              setYear(y);
              const days = new Date(y, month + 1, 0).getDate();
              if (day > days) setDay(days);
            }}
            min={1990}
            max={2050}
          />
        </div>

        {/* Date Grid box */}
        <div className="bg-white border border-gray-400 p-1.5 rounded-sm">
          {/* Week headers */}
          <div className="grid grid-cols-7 text-center font-bold text-[10px] text-gray-500 mb-1 border-b border-gray-200 pb-0.5">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          {/* Day Grid cells */}
          <div className="grid grid-cols-7 text-center gap-0.5">
            {calendarGrid.map((d, index) => {
              if (d === null) return <div key={`pad-${index}`} className="w-8 h-6" />;
              const isSelected = d === day;
              return (
                <button
                  key={`day-${d}`}
                  onClick={() => setDay(d)}
                  className={`w-8 h-6 text-[10px] font-semibold flex items-center justify-center rounded-sm transition-colors ${
                    isSelected
                      ? 'bg-[#316ac5] text-white border border-[#002d96]'
                      : 'text-gray-800 hover:bg-amber-100 hover:text-black'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time input spinner section */}
        <div className="border border-gray-300 p-2 rounded-sm bg-gray-50 flex flex-col items-center">
          <label className="block text-[10px] font-bold text-gray-600 mb-1">Time Settings (HH : MM : SS)</label>
          <div className="flex items-center gap-1.5">
            {/* Hour spinner */}
            <input
              type="number"
              className="xp-input w-12 text-center py-0.5 font-bold font-mono text-xs border border-gray-400"
              value={hours}
              min={0}
              max={23}
              onChange={e => setHours(Math.max(0, Math.min(23, Number(e.target.value))))}
            />
            <span className="font-bold">:</span>
            {/* Minute spinner */}
            <input
              type="number"
              className="xp-input w-12 text-center py-0.5 font-bold font-mono text-xs border border-gray-400"
              value={minutes}
              min={0}
              max={59}
              onChange={e => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
            />
            <span className="font-bold">:</span>
            {/* Second spinner */}
            <input
              type="number"
              className="xp-input w-12 text-center py-0.5 font-bold font-mono text-xs border border-gray-400"
              value={seconds}
              min={0}
              max={59}
              onChange={e => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const nowReal = new Date();
              setYear(nowReal.getFullYear());
              setMonth(nowReal.getMonth());
              setDay(nowReal.getDate());
              setHours(nowReal.getHours());
              setMinutes(nowReal.getMinutes());
              setSeconds(nowReal.getSeconds());
              onSetOffset(0);
            }}
            className="xp-btn px-2.5 py-1 text-[10px] font-semibold"
          >
            Reset
          </button>
          <button onClick={handleApply} className="xp-btn px-4.5 py-1 text-[10px] font-bold ml-auto">
            OK
          </button>
          <button onClick={onClose} className="xp-btn px-3 py-1 text-[10px]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Desktop Component ──────────────────────────────────────────
export const Desktop: React.FC<DesktopProps> = ({
  windows,
  onOpenApp,
  onMinimizeApp,
  onRestoreApp,
  activeWindowId,
  currentUser,
  onLogout,
  children,
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [shutdownMode, setShutdownMode] = useState<'logoff' | 'shutdown' | null>(null);
  const [showDatePopup, setShowDatePopup] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0); // ms offset
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const rippleRef = useRef(0);

  // Time ticker
  useEffect(() => {
    const updateTime = () => {
      const d = new Date(Date.now() + timeOffset);
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m} ${ampm}`);
      setDate(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, [timeOffset]);

  // Close menus on outside click
  useEffect(() => {
    const handle = () => {
      setStartMenuOpen(false);
      setContextMenu(null);
      setSelectedIcon(null);
    };
    window.addEventListener('click', handle);
    return () => window.removeEventListener('click', handle);
  }, []);

  // Desktop shortcuts — ALL apps
  const shortcuts = useMemo(() => [
    { id: 'marketplace',   title: 'Marketplace.exe',  icon: <ShoppingCart size={28} className="text-blue-400 drop-shadow-lg" /> },
    { id: 'receipt',       title: 'Smart Receipt.exe', icon: <Receipt size={28}      className="text-orange-400 drop-shadow-lg" /> },
    { id: 'shoppingAgent', title: 'ShoppingAgent.exe', icon: <Activity size={28}     className="text-green-400 drop-shadow-lg" /> },
    { id: 'analytics',     title: 'Analytics.exe',     icon: <Activity size={28}     className="text-red-400 drop-shadow-lg" /> },
    { id: 'settings',      title: 'Settings.exe',      icon: <Settings size={28}     className="text-gray-300 drop-shadow-lg" /> },
    { id: 'messenger',     title: 'Messenger.exe',     icon: <MessageSquare size={28} className="text-amber-400 drop-shadow-lg" /> },
    { id: 'agents',        title: 'AI Agents.exe',     icon: <Bot size={28}          className="text-indigo-400 drop-shadow-lg" /> },
    { id: 'news',          title: 'Agent News.exe',    icon: <Newspaper size={28}    className="text-teal-400 drop-shadow-lg" /> },
    { id: 'trustCenter',   title: 'Trust Center.exe',  icon: <Shield size={28}       className="text-emerald-400 drop-shadow-lg" /> },
    { id: 'transactions',  title: 'Transactions.exe',  icon: <Folder size={28}       className="text-yellow-500 drop-shadow-lg" /> },
  ], []);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, []);

  // Single-click to open
  const handleIconClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playBeep();
    setSelectedIcon(id);
    onOpenApp(id as AppId);
  }, [playBeep, onOpenApp]);

  // Cursor ripple on desktop mousemove
  const handleDesktopMouseMove = useCallback((e: React.MouseEvent) => {
    rippleRef.current += 1;
    const id = rippleRef.current;
    setRipple({ x: e.clientX, y: e.clientY, id });
    setTimeout(() => setRipple(r => r?.id === id ? null : r), 600);
  }, []);

  const handleShutdown = useCallback((mode: 'logoff' | 'shutdown') => {
    setStartMenuOpen(false);
    setShutdownMode(mode);
  }, []);

  const handleShutdownDone = useCallback(() => {
    setShutdownMode(null);
    if (shutdownMode === 'logoff') {
      onLogout();
    }
  }, [shutdownMode, onLogout]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      onContextMenu={handleContextMenu}
      onMouseMove={handleDesktopMouseMove}
      className="relative w-screen h-screen overflow-hidden flex flex-col font-sans"
      style={{
        backgroundImage: 'url(/desktop_wallpaper.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Cursor ripple glow */}
      {ripple && (
        <div
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x - 18,
            top: ripple.y - 18,
            width: 36,
            height: 36,
            background: 'radial-gradient(circle, rgba(100,200,255,0.45) 0%, transparent 70%)',
            animation: 'rippleFade 0.6s ease-out forwards',
            zIndex: 99999,
          }}
        />
      )}

      {/* ── Floating Bubble Layer (pointer-events: none) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1, pointerEvents: 'none' }}>
        {BUBBLES.map(b => (
          <div
            key={b.id}
            className="desktop-bubble"
            style={{
              width:  `${b.size}px`,
              height: `${b.size}px`,
              left:   `${b.left}%`,
              bottom: `-${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay:    `${b.delay}s`,
              opacity: b.opacity,
            }}
          />
        ))}

        {/* Wind streaks */}
        {STREAKS.map(s => (
          <div
            key={s.id}
            className="wind-streak"
            style={{
              top:   `${s.top}%`,
              width: `${s.width}px`,
              animationDuration: `${s.duration}s`,
              animationDelay:    `${s.delay}s`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Desktop Shortcuts Grid ── z-index 30 so they're above bubble layer */}
      <div
        className="flex-1 p-4 grid gap-y-3 gap-x-6 items-start justify-start content-start relative"
        style={{
          zIndex: 30,
          gridTemplateColumns: 'repeat(auto-fill, 80px)',
          gridTemplateRows: 'repeat(auto-fill, 86px)',
          gridAutoFlow: 'column',
        }}
      >
        {shortcuts.map((sc) => (
          <div
            key={sc.id}
            onClick={e => handleIconClick(e, sc.id)}
            onMouseEnter={() => setHoveredIcon(sc.id)}
            onMouseLeave={() => setHoveredIcon(null)}
            className={`relative flex flex-col items-center justify-center text-center cursor-pointer p-1.5 rounded border transition-all select-none ${
              selectedIcon === sc.id
                ? 'desktop-icon-selected'
                : 'border-transparent hover:bg-white/15 hover:border-white/30'
            }`}
            style={{
              width: 80, height: 86,
              transform: hoveredIcon === sc.id ? 'scale(1.12) translateY(-3px)' : 'scale(1)',
              transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), background 0.15s, border 0.15s',
              filter: hoveredIcon === sc.id ? 'drop-shadow(0 0 8px rgba(100,200,255,0.7))' : 'none',
            }}
          >
            <div className="mb-1 flex items-center justify-center w-10 h-10">{sc.icon}</div>
            <span className="text-[10px] text-white font-semibold drop-shadow-md leading-tight break-words max-w-[70px] text-center">
              {sc.title}
            </span>

          </div>
        ))}
      </div>

      {/* ── Windows Container (above icons) ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
        <div className="relative w-full h-full pointer-events-none">
          {children}
        </div>
      </div>

      {/* ── Right-Click Context Menu ── */}
      {contextMenu && (
        <div
          className="absolute bg-white border border-[#a0a0a0] shadow-lg py-1 text-xs w-[180px] font-sans border-r-2 border-b-2 border-r-gray-700 border-b-gray-700"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, zIndex: 999990 }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { setContextMenu(null); window.location.reload(); }}
            className="w-full text-left px-4 py-1.5 hover:bg-[#3f8cf3] hover:text-white">
            🔄 Refresh
          </button>
          <div className="h-px bg-gray-300 my-1" />
          <button onClick={() => { setContextMenu(null); onOpenApp('marketplace'); }}
            className="w-full text-left px-4 py-1.5 hover:bg-[#3f8cf3] hover:text-white">
            🌐 Open Marketplace
          </button>
          <button onClick={() => { setContextMenu(null); onOpenApp('shoppingAgent'); }}
            className="w-full text-left px-4 py-1.5 hover:bg-[#3f8cf3] hover:text-white">
            🤖 Deploy Agent
          </button>
          <button onClick={() => { setContextMenu(null); onOpenApp('news'); }}
            className="w-full text-left px-4 py-1.5 hover:bg-[#3f8cf3] hover:text-white">
            📰 Agent News
          </button>
          <div className="h-px bg-gray-300 my-1" />
          <button onClick={() => { setContextMenu(null); onOpenApp('settings'); }}
            className="w-full text-left px-4 py-1.5 hover:bg-[#3f8cf3] hover:text-white">
            ⚙️ Properties
          </button>
        </div>
      )}

      {/* ── Date/Time Popup ── */}
      {showDatePopup && (
        <div style={{ zIndex: 999991 }}>
          <DateTimePopup
            onClose={() => setShowDatePopup(false)}
            timeOffset={timeOffset}
            onSetOffset={setTimeOffset}
          />
        </div>
      )}

      {/* ── Start Menu ── */}
      <StartMenu
        isOpen={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onOpenApp={onOpenApp}
        currentUser={currentUser}
        onLogoff={() => handleShutdown('logoff')}
        onShutdown={() => handleShutdown('shutdown')}
      />

      {/* ── XP Taskbar ── */}
      <div className="xp-taskbar h-[40px] w-full flex items-center justify-between px-0.5 border-t border-[#0a246a]" style={{ zIndex: 99999 }}>
        
        {/* Start Button */}
        <button
          onClick={e => { e.stopPropagation(); setStartMenuOpen(s => !s); playBeep(); }}
          className="xp-start-btn flex items-center gap-1.5 px-4 h-[38px] text-white text-base font-extrabold focus:outline-none"
        >
          <span className="text-xl">🏆</span>
          <span>start</span>
        </button>

        {/* Open Windows in Taskbar */}
        <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto h-full py-1">
          {windows
            .filter(w => w.isOpen)
            .map(win => {
              const isActive = activeWindowId === win.id && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => {
                    playBeep();
                    if (isActive) onMinimizeApp(win.id);
                    else onRestoreApp(win.id);
                  }}
                  className={`xp-taskbar-btn flex items-center gap-1 px-2 py-1 rounded max-w-[140px] truncate text-[11px] font-semibold h-[28px] focus:outline-none ${isActive ? 'active' : ''}`}
                >
                  <span className="text-[10px] truncate">{win.title}</span>
                </button>
              );
            })}
        </div>

        {/* System Tray */}
        <div
          className="flex items-center gap-2 px-3 h-[38px] border-l border-[#002d96] text-white text-[11px]"
          style={{ background: 'linear-gradient(to bottom, #0c8cd6 0%, #0961ad 100%)', boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.3)' }}
        >
          <Wifi size={13} className="opacity-80" />
          <Volume2 size={13} className="opacity-80 hover:scale-110 cursor-pointer" onClick={playBeep} />
          <Battery size={13} className="opacity-80" />
          <Shield size={13} className="text-[#3cc03c] animate-pulse" />

          {/* Clock — clickable for date/time popup */}
          <button
            onClick={e => { e.stopPropagation(); setShowDatePopup(p => !p); }}
            className="flex flex-col items-center leading-none ml-1 hover:bg-white/10 px-1 rounded"
            title="Click to set date/time"
          >
            <span className="font-bold font-mono tracking-wider flex items-center gap-0.5">
              <Clock size={11} className="opacity-80" />
              {time}
              {timeOffset !== 0 && <span className="text-[8px] text-yellow-300 ml-0.5">SIM</span>}
            </span>
            <span className="text-[9px] opacity-75">{date}</span>
          </button>

          {/* User badge */}
          {currentUser && (
            <div className="ml-1 flex items-center gap-1 border-l border-[#0c8cd6] pl-2">
              <span className="text-base leading-none">{currentUser.avatar}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Shutdown/Logoff Overlay ── */}
      {shutdownMode && (
        <ShutdownOverlay mode={shutdownMode} onDone={handleShutdownDone} />
      )}
    </div>
  );
};

