import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Lock, Mail } from "lucide-react";

interface EmailProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

const Email = ({ isOpen, onClose, isMinimized = false, onMinimize, onRestore, onFocus, zIndex = 20 }: EmailProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [savedPosition, setSavedPosition] = useState({ x: 0, y: 0 });
  const [savedSize, setSavedSize] = useState({ width: 750, height: 600 });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && windowRef.current && !isMaximized) {
      const windowWidth = savedSize.width;
      const windowHeight = savedSize.height;
      setPosition({
        x: (window.innerWidth - windowWidth) / 2 + 100,
        y: (window.innerHeight - windowHeight) / 2 - 20,
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
        newWidth = Math.max(600, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(600, resizeStart.width - deltaX);
        newX = savedPosition.x + deltaX;
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(500, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(500, resizeStart.height - deltaY);
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
      setSavedSize({ width: 750, height: 600 });
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setEmail("");
        setSubmitted(false);
      }, 3000);
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
        className={`${isMaximized ? 'rounded-none' : 'rounded-window'} window-shadow overflow-hidden border border-[hsl(0_0%_0%/0.2)] relative`}
        style={{ width: windowWidth, height: windowHeight }}
      >
        {/* Browser Chrome */}
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

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-[hsl(220_10%_85%)] rounded text-card-foreground/50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-[hsl(220_10%_85%)] rounded text-card-foreground/50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* URL Bar */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[hsl(220_10%_97%)] rounded-lg border border-[hsl(220_10%_85%)] w-80">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-sm text-card-foreground/70">newsletter.subscribe.com</span>
            </div>
          </div>

          {/* Mail Icon */}
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4 text-card-foreground/60" />
          </div>
        </div>

        {/* Email Content */}
        <div className="bg-[hsl(40_20%_97%)] overflow-auto" style={{ height: isMaximized ? `calc(100vh - 48px)` : '552px' }}>
          <div className="max-w-2xl mx-auto px-8 py-12">
            <div className="bg-white rounded-xl shadow-lg border border-[hsl(40_10%_90%)] p-8">
              <div className="text-center mb-8">
                <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h1 className="text-3xl font-light text-card-foreground mb-2">Stay Updated</h1>
                <p className="text-card-foreground/70 text-sm">Subscribe to our newsletter for the latest updates</p>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-medium text-card-foreground mb-2">Thank you for subscribing!</h2>
                  <p className="text-card-foreground/70 text-sm">Check your email to confirm your subscription.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[hsl(220_10%_85%)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-card-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md"
                  >
                    Subscribe
                  </button>

                  <p className="text-xs text-center text-card-foreground/50">
                    By subscribing, you agree to receive updates. You can unsubscribe at any time.
                  </p>
                </form>
              )}

              <div className="mt-8 pt-8 border-t border-[hsl(220_10%_90%)]">
                <h3 className="text-sm font-medium text-card-foreground mb-3">What to expect:</h3>
                <ul className="space-y-2 text-sm text-card-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Weekly updates on new releases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Exclusive behind-the-scenes content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Early access to new tracks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Special offers and announcements</span>
                  </li>
                </ul>
              </div>
            </div>
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

export default Email;

