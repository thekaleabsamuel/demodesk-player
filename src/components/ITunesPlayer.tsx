import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";
import WindowChrome from "./WindowChrome";

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
}

interface ITunesPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoTracks: Track[] = [
  { id: 1, title: "Late Night Drive", artist: "You", album: "Demos Vol. 1", duration: "3:42", durationSeconds: 222 },
  { id: 2, title: "Sunrise Memories", artist: "You", album: "Demos Vol. 1", duration: "4:15", durationSeconds: 255 },
  { id: 3, title: "City Lights", artist: "You", album: "Demos Vol. 1", duration: "3:58", durationSeconds: 238 },
  { id: 4, title: "Echoes", artist: "You", album: "Demos Vol. 1", duration: "5:02", durationSeconds: 302 },
  { id: 5, title: "Fading Away", artist: "You", album: "Demos Vol. 1", duration: "4:30", durationSeconds: 270 },
  { id: 6, title: "New Beginnings", artist: "You", album: "Demos Vol. 2", duration: "3:22", durationSeconds: 202 },
  { id: 7, title: "Daydream", artist: "You", album: "Demos Vol. 2", duration: "4:45", durationSeconds: 285 },
  { id: 8, title: "Midnight Blues", artist: "You", album: "Demos Vol. 2", duration: "5:18", durationSeconds: 318 },
];

const ITunesPlayer = ({ isOpen, onClose }: ITunesPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(demoTracks[0]);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Center window on open
  useEffect(() => {
    if (isOpen && windowRef.current) {
      const windowWidth = 800;
      const windowHeight = 520;
      setPosition({
        x: (window.innerWidth - windowWidth) / 2,
        y: (window.innerHeight - windowHeight) / 2,
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

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + (100 / currentTrack.durationSeconds);
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    const currentIndex = demoTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % demoTracks.length;
    setCurrentTrack(demoTracks[nextIndex]);
    setProgress(0);
  };

  const handlePrev = () => {
    const currentIndex = demoTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? demoTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(demoTracks[prevIndex]);
    setProgress(0);
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.floor((progress / 100) * currentTrack.durationSeconds);

  if (!isOpen) return null;

  return (
    <div 
      ref={windowRef}
      className={`fixed z-30 ${isClosing ? 'animate-window-close' : 'animate-window-open'} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-[800px] rounded-window window-shadow overflow-hidden border border-[hsl(0_0%_0%/0.2)]">
        {/* Draggable Title Bar */}
        <div 
          onMouseDown={handleMouseDown}
          className={`cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          <WindowChrome title="iTunes" onClose={handleClose} />
        </div>
        
        {/* Player Controls */}
        <div className="bg-itunes-gradient px-4 py-3 border-b border-[hsl(0_0%_0%/0.3)]">
          <div className="flex items-center gap-6">
            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-2 hover:bg-[hsl(0_0%_100%/0.1)] rounded transition-colors">
                <SkipBack className="w-4 h-4 text-itunes-text" fill="currentColor" />
              </button>
              <button 
                onClick={handlePlayPause}
                className="p-2 hover:bg-[hsl(0_0%_100%/0.1)] rounded transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-itunes-text" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 text-itunes-text" fill="currentColor" />
                )}
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-[hsl(0_0%_100%/0.1)] rounded transition-colors">
                <SkipForward className="w-4 h-4 text-itunes-text" fill="currentColor" />
              </button>
            </div>

            {/* Now Playing Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                {/* Album Art Placeholder */}
                <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">♪</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-itunes-text truncate">{currentTrack.title}</p>
                  <p className="text-xs text-itunes-muted truncate">{currentTrack.artist} — {currentTrack.album}</p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-itunes-muted w-8">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-[hsl(var(--progress-bg))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[hsl(var(--progress-fill))] rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-itunes-muted w-8 text-right">{currentTrack.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-itunes-muted" />
              <div className="w-20 h-1 bg-[hsl(var(--progress-bg))] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[hsl(var(--progress-fill))] rounded-full"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="bg-gradient-to-b from-[hsl(220_15%_18%)] to-[hsl(220_20%_12%)] h-[400px] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 grid grid-cols-[40px_1fr_150px_120px_80px] gap-2 px-4 py-2 bg-[hsl(0_0%_0%/0.3)] border-b border-[hsl(0_0%_100%/0.1)] text-xs text-itunes-muted uppercase tracking-wider">
            <span></span>
            <span>Name</span>
            <span>Artist</span>
            <span>Album</span>
            <span className="text-right">Time</span>
          </div>
          
          {/* Tracks */}
          {demoTracks.map((track, index) => (
            <div 
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={`
                grid grid-cols-[40px_1fr_150px_120px_80px] gap-2 px-4 py-2 cursor-pointer
                border-b border-[hsl(0_0%_100%/0.05)]
                ${currentTrack.id === track.id 
                  ? 'bg-itunes-accent/30 text-itunes-text' 
                  : 'text-itunes-muted hover:bg-[hsl(0_0%_100%/0.05)]'
                }
                transition-colors
              `}
            >
              <span className="text-sm text-center">
                {currentTrack.id === track.id && isPlaying ? (
                  <span className="inline-block animate-pulse">♪</span>
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-sm truncate font-medium">{track.title}</span>
              <span className="text-sm truncate">{track.artist}</span>
              <span className="text-sm truncate">{track.album}</span>
              <span className="text-sm text-right">{track.duration}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[hsl(220_20%_10%)] px-4 py-2 flex items-center justify-between border-t border-[hsl(0_0%_0%/0.3)]">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-itunes-muted hover:text-itunes-text cursor-pointer transition-colors" />
            <Repeat className="w-4 h-4 text-itunes-muted hover:text-itunes-text cursor-pointer transition-colors" />
          </div>
          <span className="text-xs text-itunes-muted">{demoTracks.length} songs</span>
        </div>
      </div>
    </div>
  );
};

export default ITunesPlayer;
