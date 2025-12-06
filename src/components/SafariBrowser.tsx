import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Lock, Share, Plus } from "lucide-react";
import WindowChrome from "./WindowChrome";

interface SafariBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlogPost {
  id: number;
  date: string;
  title: string;
  content: string;
  type: "text" | "video" | "image";
  media?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    date: "Dec 5, 2024",
    title: "New Demos Coming Soon",
    content: "Been in the studio all week working on some new sounds. Can't wait to share what's coming next. The vibes are immaculate.",
    type: "text",
  },
  {
    id: 2,
    date: "Dec 1, 2024",
    title: "This video lives rent free in my head",
    content: "",
    type: "video",
    media: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 3,
    date: "Nov 28, 2024",
    title: "Studio Session",
    content: "Late nights, good music, great company. This is where the magic happens.",
    type: "image",
    media: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    date: "Nov 20, 2024",
    title: "Grateful",
    content: "Thank you to everyone who's been listening to the demos. Your support means everything. More music on the way 🎵",
    type: "text",
  },
  {
    id: 5,
    date: "Nov 15, 2024",
    title: "Inspiration",
    content: "",
    type: "image",
    media: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop",
  },
];

const SafariBrowser = ({ isOpen, onClose }: SafariBrowserProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && windowRef.current) {
      const windowWidth = 700;
      const windowHeight = 550;
      setPosition({
        x: (window.innerWidth - windowWidth) / 2 + 50,
        y: (window.innerHeight - windowHeight) / 2 - 20,
      });
    }
  }, [isOpen]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={windowRef}
      className={`fixed z-20 ${isClosing ? 'animate-window-close' : 'animate-window-open'} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-[700px] rounded-window window-shadow overflow-hidden border border-[hsl(0_0%_0%/0.2)]">
        {/* Safari Chrome */}
        <div 
          onMouseDown={handleMouseDown}
          className={`flex items-center gap-3 h-12 px-4 bg-gradient-to-b from-[hsl(220_10%_95%)] to-[hsl(220_10%_90%)] rounded-t-window border-b border-[hsl(220_10%_80%)] cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <button onClick={handleClose} className="traffic-light traffic-light-red group relative">
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-red-900 opacity-0 group-hover:opacity-100">×</span>
            </button>
            <button className="traffic-light traffic-light-yellow group relative">
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-yellow-900 opacity-0 group-hover:opacity-100">−</span>
            </button>
            <button className="traffic-light traffic-light-green group relative">
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
              <span className="text-sm text-card-foreground/70">myblog.artist.com</span>
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
        <div className="bg-[hsl(40_20%_97%)] h-[500px] overflow-auto">
          {/* Blog Header */}
          <header className="bg-gradient-to-r from-[hsl(220_40%_25%)] to-[hsl(280_30%_25%)] px-8 py-10 text-center">
            <h1 className="text-3xl font-light text-white tracking-wide mb-2">Life Updates</h1>
            <p className="text-white/60 text-sm">thoughts, music, and everything in between</p>
          </header>

          {/* Blog Posts */}
          <div className="px-8 py-6 space-y-8 max-w-xl mx-auto">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-[hsl(40_10%_90%)]">
                <time className="text-xs text-card-foreground/40 uppercase tracking-wider">{post.date}</time>
                <h2 className="text-lg font-medium text-card-foreground mt-1 mb-3">{post.title}</h2>
                
                {post.type === "text" && (
                  <p className="text-card-foreground/70 leading-relaxed">{post.content}</p>
                )}
                
                {post.type === "video" && post.media && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={post.media}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                
                {post.type === "image" && post.media && (
                  <>
                    <img 
                      src={post.media} 
                      alt={post.title}
                      className="w-full rounded-lg"
                    />
                    {post.content && (
                      <p className="text-card-foreground/70 leading-relaxed mt-3">{post.content}</p>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafariBrowser;
