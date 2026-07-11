import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';

interface WindowFrameProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  active: boolean;
  shake?: boolean;
  icon?: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  // id prop kept in interface for keying by parent
  title,
  isOpen,
  isMinimized,
  isMaximized,
  x,
  y,
  width,
  height,
  zIndex,
  active,
  shake = false,
  icon,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  children,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        // Boundaries checks: keep window visible on screen
        const nextX = Math.max(0, Math.min(window.innerWidth - 100, x + dx));
        const nextY = Math.max(0, Math.min(window.innerHeight - 40, y + dy));
        
        onMove(nextX, nextY);
        setDragStart({ x: e.clientX, y: e.clientY });
      }

      if (isResizing && !isMaximized) {
        const dw = e.clientX - resizeStart.x;
        const dh = e.clientY - resizeStart.y;
        
        const nextW = Math.max(300, resizeStart.w + dw);
        const nextH = Math.max(200, resizeStart.h + dh);
        
        onResize(nextW, nextH);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
      if (isResizing) setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, x, y, isMaximized, onMove, onResize]);

  if (!isOpen || isMinimized) return null;

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    // Only drag with left click and not on control buttons
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    
    setIsResizing(true);
    setResizeStart({
      w: width,
      h: height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100% - 40px)', // taskbar offset
        zIndex,
        pointerEvents: 'auto',
      }
    : {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex,
        pointerEvents: 'auto',
      };

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      onClick={onFocus}
      className={`xp-window flex flex-col overflow-hidden select-none border-t-[3px] border-x-[3px] border-b-[3px] border-[#0054e3] ${
        active ? 'ring-1 ring-[#0a246a]' : 'brightness-95'
      } ${shake ? 'msn-nudge' : ''}`}
    >
      {/* XP Titlebar */}
      <div
        onMouseDown={handleTitleMouseDown}
        className={`xp-titlebar flex items-center justify-between px-2 py-1 select-none cursor-default h-[30px] ${
          active
            ? 'linear-gradient'
            : 'bg-gradient-to-b from-[#7697e7] to-[#0047cc] opacity-80'
        }`}
      >
        <div className="flex items-center gap-1.5 font-sans font-bold text-sm text-white select-none truncate pr-4">
          {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
          <span>{title}</span>
        </div>
        
        {/* Titlebar Control Buttons */}
        <div className="flex items-center gap-1.5 no-drag">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="xp-titlebar-btn xp-titlebar-btn-min flex items-end justify-center pb-0.5"
            title="Minimize"
          >
            <Minus size={10} strokeWidth={4} className="text-white" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="xp-titlebar-btn xp-titlebar-btn-max flex items-center justify-center"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            <Square size={8} strokeWidth={4} className="text-white" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="xp-titlebar-btn xp-titlebar-btn-close flex items-center justify-center"
            title="Close"
          >
            <X size={10} strokeWidth={4} className="text-white" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 flex flex-col bg-[#ece9d8] overflow-hidden text-black font-sans relative">
        {children}
      </div>

      {/* Resize handle (bottom-right) */}
      {!isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-end justify-end p-0.5"
          style={{ cursor: 'nwse-resize' }}
        >
          {/* Classic diagonal dots resize indicator */}
          <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60">
            <line x1="8" y1="2" x2="2" y2="8" stroke="#808080" strokeWidth="1" />
            <line x1="8" y1="5" x2="5" y2="8" stroke="#808080" strokeWidth="1" />
            <line x1="8" y1="8" x2="8" y2="8" stroke="#808080" strokeWidth="1.5" />
            
            <line x1="9" y1="3" x2="3" y2="9" stroke="#fff" strokeWidth="1" />
            <line x1="9" y1="6" x2="6" y2="9" stroke="#fff" strokeWidth="1" />
            <line x1="9" y1="9" x2="9" y2="9" stroke="#fff" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
};
