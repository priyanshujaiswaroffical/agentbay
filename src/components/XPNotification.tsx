import React, { useEffect } from 'react';
import { X, Info, ShieldAlert, BadgeCheck } from 'lucide-react';

interface XPNotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  onClose: (id: string) => void;
}

export const XPNotification: React.FC<XPNotificationProps> = ({
  id,
  title,
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    // Play classic notification sound or just standard sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      // Classic XP alert sound: two rapid high pitch notes or simple pleasant chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Web Audio blocked or unsupported', e);
    }

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      onClose(id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <ShieldAlert className="text-[#d82b0e]" size={20} />;
      case 'success':
        return <BadgeCheck className="text-[#30a030]" size={20} />;
      case 'info':
      default:
        return <Info className="text-[#0054e3]" size={20} />;
    }
  };

  return (
    <div
      className="fixed bottom-[48px] right-4 z-[9999] w-[260px] p-2 bg-[#ffffe1] border border-[#000] rounded-[6px] shadow-lg animate-bounce-in flex flex-col font-sans"
      style={{
        boxShadow: '3px 3px 6px rgba(0,0,0,0.3)',
      }}
    >
      {/* Balloon Header */}
      <div className="flex items-center justify-between border-b border-[#ffd700] pb-1 mb-1">
        <div className="flex items-center gap-1.5 font-bold text-xs text-[#000]">
          {getIcon()}
          <span>{title}</span>
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-gray-500 hover:text-black hover:bg-[#ffebad] rounded p-0.5"
        >
          <X size={10} />
        </button>
      </div>

      {/* Balloon Content */}
      <div className="text-xs text-[#000] leading-relaxed break-words">
        {message}
      </div>
      
      {/* Balloon Tail */}
      <div 
        className="absolute bottom-[-10px] right-[24px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#000]"
      />
      <div 
        className="absolute bottom-[-8px] right-[24px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#ffffe1]"
      />
    </div>
  );
};
