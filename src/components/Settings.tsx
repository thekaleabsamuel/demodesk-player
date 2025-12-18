import { useState, useRef, useEffect, useCallback } from "react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

const Settings = ({ isOpen, onClose, isMinimized = false, onMinimize, onRestore, onFocus, zIndex = 20 }: SettingsProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [savedPosition, setSavedPosition] = useState({ x: 0, y: 0 });
  const [savedSize, setSavedSize] = useState({ width: 900, height: 550 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && windowRef.current && !isMaximized) {
      const windowWidth = savedSize.width;
      const windowHeight = savedSize.height;
      setPosition({
        x: (window.innerWidth - windowWidth) / 2,
        y: (window.innerHeight - windowHeight) / 2,
      });
    }
  }, [isOpen, isMaximized, savedSize]);

  useEffect(() => {
    if (isMaximized) {
      setPosition({ x: 0, y: 0 });
    } else if (isOpen && savedPosition.x !== 0 && savedPosition.y !== 0) {
      setPosition(savedPosition);
    }
  }, [isMaximized, isOpen, savedPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (windowRef.current && !isMaximized) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, [isMaximized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    } else if (isResizing && resizeDirection) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = savedPosition.x;
      let newY = savedPosition.y;

      if (resizeDirection.includes('right')) {
        newWidth = Math.max(500, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(500, resizeStart.width - deltaX);
        newX = savedPosition.x + deltaX;
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(400, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(400, resizeStart.height - deltaY);
        newY = savedPosition.y + deltaY;
      }

      setSavedSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, resizeDirection, resizeStart, dragOffset, isMaximized, savedPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (windowRef.current && !isMaximized) {
      const rect = windowRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      });
      setResizeDirection(direction);
      setIsResizing(true);
      setSavedPosition(position);
    }
  }, [isMaximized, position]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMaximized(false);
      onClose();
    }, 150);
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setPosition(savedPosition);
    } else {
      setSavedPosition(position);
      setSavedSize({ width: 900, height: 550 });
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isOpen || isMinimized) return null;

  const windowWidth = isMaximized ? window.innerWidth : savedSize.width;
  const windowHeight = isMaximized ? window.innerHeight : savedSize.height;

  return (
    <div 
      ref={windowRef}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'A' || target.closest('button') || target.closest('input') || target.closest('a')) {
          return;
        }
        onFocus?.();
      }}
      className={`fixed ${isClosing ? 'animate-window-close' : 'animate-window-open'} ${isDragging ? 'cursor-grabbing' : ''} ${isDragging || isResizing ? '' : 'transition-all duration-300'}`}
      style={{ 
        left: position.x, 
        top: position.y,
        zIndex: zIndex,
        width: isMaximized ? '100vw' : 'auto',
        height: isMaximized ? '100vh' : 'auto'
      }}
    >
      <div 
        className={`${isMaximized ? 'rounded-none' : 'rounded-window'} window-shadow overflow-hidden border border-[hsl(0_0%_0%/0.2)] relative bg-white`}
        style={{ width: windowWidth, height: windowHeight }}
      >
        {/* Settings Chrome */}
        <div 
          onMouseDown={handleMouseDown}
          className={`flex items-center gap-3 h-12 px-4 bg-gradient-to-b from-[hsl(220_10%_95%)] to-[hsl(220_10%_90%)] rounded-t-window border-b border-[hsl(220_10%_80%)] ${isMaximized ? '' : `cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}`}
        >
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <button onClick={handleClose} className="traffic-light traffic-light-red group relative">
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-red-900 opacity-0 group-hover:opacity-100">×</span>
            </button>
            <button onClick={handleMinimize} className="traffic-light traffic-light-yellow group relative">
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-yellow-900 opacity-0 group-hover:opacity-100">−</span>
            </button>
            <button onClick={handleMaximize} className="traffic-light traffic-light-green group relative">
              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-green-900 opacity-0 group-hover:opacity-100">⤢</span>
            </button>
          </div>

          {/* Title */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm font-medium text-card-foreground/90">About This Mac</span>
          </div>

          <div className="w-16" />
        </div>

        {/* About Content */}
        <div 
          className="bg-gradient-to-b from-[hsl(220_10%_98%)] to-white overflow-hidden" 
          style={{ height: isMaximized ? `calc(100vh - 48px)` : '502px' }}
        >
          <div className="flex flex-col items-center justify-center h-full px-6 py-6">
            {/* Mac Logo/Icon */}
            <div className="mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
            </div>

            {/* System Information */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-light text-card-foreground mb-1">macOS</h1>
              <p className="text-xl font-light text-card-foreground/70 mb-0.5">Ventura</p>
              <p className="text-xs text-card-foreground/50">Version 13.2.1</p>
            </div>

            {/* Hardware Info */}
            <div className="w-full max-w-sm space-y-2 mb-4">
              <div className="flex justify-between items-center py-1.5 border-b border-[hsl(220_10%_90%)]">
                <span className="text-xs text-card-foreground/70">Processor</span>
                <span className="text-xs font-medium text-card-foreground">Apple M1</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[hsl(220_10%_90%)]">
                <span className="text-xs text-card-foreground/70">Memory</span>
                <span className="text-xs font-medium text-card-foreground">16 GB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[hsl(220_10%_90%)]">
                <span className="text-xs text-card-foreground/70">Graphics</span>
                <span className="text-xs font-medium text-card-foreground">Apple M1</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[hsl(220_10%_90%)]">
                <span className="text-xs text-card-foreground/70">Serial Number</span>
                <span className="text-xs font-medium text-card-foreground">C02XK0XXXXXX</span>
              </div>
            </div>

            {/* Software Update Button */}
            <button className="px-5 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm mb-3">
              Software Update...
            </button>

            {/* Copyright */}
            <p className="text-[10px] text-card-foreground/40 text-center">
              Copyright © 2024 Apple Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Resize Handles */}
        {!isMaximized && (
          <>
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'top-left')}
              className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'top-right')}
              className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
              className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'top')}
              className="absolute top-0 left-4 right-4 h-2 cursor-ns-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              className="absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'left')}
              className="absolute left-0 top-4 bottom-4 w-2 cursor-ew-resize z-50"
            />
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'right')}
              className="absolute right-0 top-4 bottom-4 w-2 cursor-ew-resize z-50"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;

