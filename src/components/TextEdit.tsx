import { useState, useRef, useEffect, useCallback } from "react";
import WindowChrome from "./WindowChrome";
import { FileText, Save, Plus, Trash2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialNotes } from "@/data/notes";

interface TextEditProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'demodesk_notes';

const getNotes = (): Note[] => {
  // Use hardcoded initial notes instead of localStorage
  return initialNotes;
};

const saveNotes = (notes: Note[]): void => {
  // Notes are now hardcoded, so we don't save to localStorage
  // This function is kept for compatibility but doesn't do anything
};

const TextEdit = ({ isOpen, onClose, isMinimized = false, onMinimize, onRestore, onFocus, zIndex = 25 }: TextEditProps) => {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [savedPosition, setSavedPosition] = useState({ x: 0, y: 0 });
  const [savedSize, setSavedSize] = useState({ width: 800, height: 600 });
  const [showSidebar, setShowSidebar] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes when window opens
  useEffect(() => {
    if (isOpen) {
      setNotes(getNotes());
    }
  }, [isOpen]);

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
    handleSave(); // Auto-save before closing
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMaximized(false);
      setCurrentNote(null);
      setContent("");
      setTitle("");
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
      setSavedSize({ width: 800, height: 600 });
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleNewNote = () => {
    handleSave(); // Save current note first
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentNote(newNote);
    setTitle("Untitled");
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectNote = (note: Note) => {
    handleSave(); // Save current note first
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return; // Don't save empty notes
    
    const updatedNotes = [...notes];
    const now = new Date().toISOString();
    
    if (currentNote) {
      // Update existing note
      const index = updatedNotes.findIndex(n => n.id === currentNote.id);
      if (index !== -1) {
        updatedNotes[index] = {
          ...updatedNotes[index],
          title: title.trim() || "Untitled",
          content,
          updatedAt: now,
        };
      } else {
        // Note was deleted, create new one
        updatedNotes.push({
          id: currentNote.id,
          title: title.trim() || "Untitled",
          content,
          createdAt: currentNote.createdAt || now,
          updatedAt: now,
        });
      }
    } else if (title.trim() || content.trim()) {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim() || "Untitled",
        content,
        createdAt: now,
        updatedAt: now,
      };
      updatedNotes.push(newNote);
      setCurrentNote(newNote);
    }
    
    saveNotes(updatedNotes);
    setNotes(updatedNotes);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      const updatedNotes = notes.filter(n => n.id !== noteId);
      saveNotes(updatedNotes);
      setNotes(updatedNotes);
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setTitle("");
        setContent("");
      }
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
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'A' || target.tagName === 'TEXTAREA' || target.closest('button') || target.closest('input') || target.closest('a') || target.closest('textarea')) {
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
        {/* Title Bar */}
        <div 
          onMouseDown={handleMouseDown}
          className={isMaximized ? '' : `cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          <WindowChrome 
            title={currentNote ? `${currentNote.title} - TextEdit` : "TextEdit"} 
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewNote}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-8"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="h-8"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-full" style={{ height: isMaximized ? `calc(100vh - 100px)` : `${savedSize.height - 100}px` }}>
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-auto">
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                <div className="space-y-1">
                  {notes.length === 0 ? (
                    <p className="text-sm text-gray-400 p-2">No notes yet</p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className={`group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-200 ${
                          currentNote?.id === note.id ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleSelectNote(note)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{note.title}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              placeholder="Note title..."
              className="px-4 py-2 border-b border-gray-200 focus:outline-none focus:border-blue-500 text-lg font-medium text-black"
            />
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave}
              placeholder="Start typing your note..."
              className="flex-1 w-full px-4 py-3 resize-none focus:outline-none font-mono text-sm text-black"
              style={{ minHeight: '200px' }}
            />
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

export default TextEdit;

