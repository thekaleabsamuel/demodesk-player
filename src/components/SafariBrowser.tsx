import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Lock, Share, Plus } from "lucide-react";
import WindowChrome from "./WindowChrome";
import { blogPosts } from "@/data/blogPosts";
import { convertYouTubeUrl } from "@/lib/storage";

interface SafariBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

const SafariBrowser = ({ isOpen, onClose, isMinimized = false, onMinimize, onRestore, onFocus, zIndex = 20 }: SafariBrowserProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [savedPosition, setSavedPosition] = useState({ x: 0, y: 0 });
  const [savedSize, setSavedSize] = useState({ width: 700, height: 550 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && windowRef.current && !isMaximized) {
      const windowWidth = savedSize.width;
      const windowHeight = savedSize.height;
      setPosition({
        x: (window.innerWidth - windowWidth) / 2 + 50,
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
      // Restore
      setIsMaximized(false);
      setPosition(savedPosition);
    } else {
      // Maximize
      setSavedPosition(position);
      setSavedSize({ width: 700, height: 550 });
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
        // Don't focus if clicking on interactive elements
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
        {/* Safari Chrome */}
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
              <span className="text-sm text-card-foreground/70">SomethingVague.blog.com</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-[hsl(220_10%_85%)] rounded text-card-foreground/60">
              <Share className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-[hsl(220_10%_85%)] rounded text-card-foreground/60">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser Content */}
        <div className="bg-[hsl(40_20%_97%)] overflow-auto" style={{ height: isMaximized ? `calc(100vh - 48px)` : '500px' }}>
          {/* Blog Header */}
          <header className="bg-gradient-to-r from-[hsl(220_40%_25%)] to-[hsl(280_30%_25%)] px-8 py-10 text-center">
            <h1 className="text-3xl font-light text-white tracking-wide mb-2">Life Updates</h1>
            <p className="text-white/60 text-sm">thoughts, music, and everything in between</p>
          </header>

          {/* Blog Posts */}
          <div className="px-8 py-6 space-y-8 max-w-xl mx-auto">
            {blogPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg mb-2">No blog posts yet</p>
                <p className="text-slate-400 text-sm">Add posts in the admin panel</p>
              </div>
            ) : (
              blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-[hsl(40_10%_90%)]">
                <time className="text-xs text-card-foreground/40 uppercase tracking-wider">{post.date}</time>
                <h2 className="text-lg font-medium text-card-foreground mt-1 mb-2">{post.title}</h2>
                
                {post.content && post.type === "video" && (
                  <p className="text-card-foreground/70 leading-relaxed mb-3 text-sm">{post.content}</p>
                )}
                
                {post.type === "text" && (
                  <p className="text-card-foreground/70 leading-relaxed">{post.content}</p>
                )}
                
                {post.type === "video" && post.media && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    {post.media.includes("youtube.com") || post.media.includes("youtu.be") ? (
                      <iframe
                        src={convertYouTubeUrl(post.media)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        frameBorder="0"
                        loading="lazy"
                      />
                    ) : (
                      <video src={post.media} controls className="w-full h-full" />
                    )}
                  </div>
                )}
                
                {post.type === "image" && post.media && (
                  <>
                    <img 
                      src={post.media} 
                      alt={post.title}
                      className="w-full rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {post.content && (
                      <p className="text-card-foreground/70 leading-relaxed mt-3">{post.content}</p>
                    )}
                  </>
                )}
              </article>
              ))
            )}
          </div>
        </div>

        {/* Resize Handles */}
        {!isMaximized && (
          <>
            {/* Corners */}
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
            {/* Edges */}
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

export default SafariBrowser;
