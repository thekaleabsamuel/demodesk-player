import { useState, useRef, useEffect, useCallback } from "react";
import { Image, Music, FileText, Folder, File, X } from "lucide-react";
import WindowChrome from "./WindowChrome";
// Import actual images
import twoGreedyImg from "@/assets/2greedy.png";
import cardiganImg from "@/assets/Cardigan.png";
import cumngoImg from "@/assets/cumngo.jpg";
import lunaImg from "@/assets/Luna Character Design Sheet.png";
import vampireImg from "@/assets/Vampire artwork.png";

interface FinderProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

interface FileItem {
  name: string;
  type: 'image' | 'audio' | 'document' | 'folder';
  icon: React.ReactNode;
  size?: string;
  date?: string;
  imageSrc?: string;
}

const Finder = ({ isOpen, onClose, isMinimized = false, onMinimize, onRestore, onFocus, zIndex = 20 }: FinderProps) => {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Files with actual image sources
  const files: FileItem[] = [
    { name: "2greedy.png", type: "image", icon: <Image className="w-8 h-8 text-blue-500" />, size: "2.4 MB", date: "Dec 1, 2024", imageSrc: twoGreedyImg },
    { name: "Cardigan.png", type: "image", icon: <Image className="w-8 h-8 text-blue-500" />, size: "1.8 MB", date: "Nov 28, 2024", imageSrc: cardiganImg },
    { name: "cumngo.jpg", type: "image", icon: <Image className="w-8 h-8 text-blue-500" />, size: "3.2 MB", date: "Nov 25, 2024", imageSrc: cumngoImg },
    { name: "Luna Character Design Sheet.png", type: "image", icon: <Image className="w-8 h-8 text-blue-500" />, size: "5.1 MB", date: "Nov 20, 2024", imageSrc: lunaImg },
    { name: "Vampire artwork.png", type: "image", icon: <Image className="w-8 h-8 text-blue-500" />, size: "4.3 MB", date: "Nov 15, 2024", imageSrc: vampireImg },
    { name: "2 greedy.mp3", type: "audio", icon: <Music className="w-8 h-8 text-pink-500" />, size: "4.2 MB", date: "Dec 5, 2024" },
    { name: "cardigan. 08 23 25 3.mp3", type: "audio", icon: <Music className="w-8 h-8 text-pink-500" />, size: "5.8 MB", date: "Dec 3, 2024" },
    { name: "cumngo 3.mp3", type: "audio", icon: <Music className="w-8 h-8 text-pink-500" />, size: "6.1 MB", date: "Nov 30, 2024" },
    { name: "vampire v3.2.mp3", type: "audio", icon: <Music className="w-8 h-8 text-pink-500" />, size: "5.5 MB", date: "Nov 22, 2024" },
    { name: "Documents", type: "folder", icon: <Folder className="w-8 h-8 text-yellow-500" />, date: "Nov 10, 2024" },
    { name: "Projects", type: "folder", icon: <Folder className="w-8 h-8 text-yellow-500" />, date: "Oct 15, 2024" },
    { name: "Notes.txt", type: "document", icon: <FileText className="w-8 h-8 text-gray-500" />, size: "12 KB", date: "Dec 8, 2024" },
    { name: "Ideas.pdf", type: "document", icon: <File className="w-8 h-8 text-red-500" />, size: "245 KB", date: "Dec 6, 2024" },
    { name: "Screenshots", type: "folder", icon: <Folder className="w-8 h-8 text-yellow-500" />, date: "Nov 5, 2024" },
  ];

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
        newWidth = Math.max(600, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(600, resizeStart.width - deltaX);
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
        {/* Finder Chrome */}
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 ml-4">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'grid' ? 'bg-[hsl(220_10%_85%)]' : 'hover:bg-[hsl(220_10%_90%)]'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-[hsl(220_10%_85%)]' : 'hover:bg-[hsl(220_10%_90%)]'}`}
            >
              List
            </button>
          </div>

          {/* Title */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm font-medium text-card-foreground/90">Documents</span>
          </div>

          <div className="w-16" />
        </div>

        {/* Finder Content */}
        <div 
          className="bg-[hsl(0_0%_98%)] overflow-auto" 
          style={{ height: isMaximized ? `calc(100vh - 48px)` : '502px' }}
        >
          {viewMode === 'grid' ? (
            <div className="p-6 grid grid-cols-4 gap-6">
              {files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (file.type === 'image' && file.imageSrc) {
                      setSelectedImage(file.imageSrc);
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-[hsl(220_10%_95%)] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-center w-24 h-24 rounded-lg overflow-hidden bg-[hsl(220_10%_95%)] border border-[hsl(220_10%_85%)]">
                    {file.type === 'image' && file.imageSrc ? (
                      <img 
                        src={file.imageSrc} 
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        {file.icon}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-center text-card-foreground/80 group-hover:text-card-foreground break-words max-w-[120px]">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <table className="w-full">
                <thead className="border-b border-[hsl(220_10%_85%)]">
                  <tr>
                    <th className="text-left py-2 px-4 text-xs font-medium text-card-foreground/60">Name</th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-card-foreground/60">Size</th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-card-foreground/60">Date Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => (
                    <tr
                      key={index}
                      onClick={() => {
                        if (file.type === 'image' && file.imageSrc) {
                          setSelectedImage(file.imageSrc);
                        }
                      }}
                      className="hover:bg-[hsl(220_10%_95%)] cursor-pointer border-b border-[hsl(220_10%_90%)]"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {file.type === 'image' && file.imageSrc ? (
                              <img 
                                src={file.imageSrc} 
                                alt={file.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              file.icon
                            )}
                          </div>
                          <span className="text-sm text-card-foreground">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-card-foreground/70">
                        {file.size || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-card-foreground/70">
                        {file.date || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
          style={{ zIndex: zIndex + 100 }}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[hsl(220_10%_85%)]">
              <span className="text-sm font-medium text-card-foreground">
                {files.find(f => f.imageSrc === selectedImage)?.name}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-[hsl(220_10%_95%)] rounded transition-colors"
              >
                <X className="w-5 h-5 text-card-foreground/70" />
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <img 
                src={selectedImage} 
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finder;

