import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music, Disc, ListMusic } from "lucide-react";
import WindowChrome from "./WindowChrome";

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
}

interface Album {
  id: string;
  name: string;
  year: string;
  tracks: Track[];
  color: string;
}

interface ITunesPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const albums: Album[] = [
  {
    id: "demos-vol-1",
    name: "Demos Vol. 1",
    year: "2024",
    color: "from-purple-500 to-pink-500",
    tracks: [
      { id: 1, title: "Late Night Drive", artist: "You", album: "Demos Vol. 1", duration: "3:42", durationSeconds: 222 },
      { id: 2, title: "Sunrise Memories", artist: "You", album: "Demos Vol. 1", duration: "4:15", durationSeconds: 255 },
      { id: 3, title: "City Lights", artist: "You", album: "Demos Vol. 1", duration: "3:58", durationSeconds: 238 },
      { id: 4, title: "Echoes", artist: "You", album: "Demos Vol. 1", duration: "5:02", durationSeconds: 302 },
      { id: 5, title: "Fading Away", artist: "You", album: "Demos Vol. 1", duration: "4:30", durationSeconds: 270 },
    ],
  },
  {
    id: "demos-vol-2",
    name: "Demos Vol. 2",
    year: "2024",
    color: "from-blue-500 to-cyan-400",
    tracks: [
      { id: 6, title: "New Beginnings", artist: "You", album: "Demos Vol. 2", duration: "3:22", durationSeconds: 202 },
      { id: 7, title: "Daydream", artist: "You", album: "Demos Vol. 2", duration: "4:45", durationSeconds: 285 },
      { id: 8, title: "Midnight Blues", artist: "You", album: "Demos Vol. 2", duration: "5:18", durationSeconds: 318 },
    ],
  },
  {
    id: "summer-single",
    name: "Summer Nights",
    year: "2024",
    color: "from-orange-500 to-yellow-400",
    tracks: [
      { id: 9, title: "Summer Nights", artist: "You", album: "Summer Nights - Single", duration: "3:55", durationSeconds: 235 },
    ],
  },
  {
    id: "moonlight-single",
    name: "Moonlight",
    year: "2023",
    color: "from-indigo-500 to-purple-400",
    tracks: [
      { id: 10, title: "Moonlight", artist: "You", album: "Moonlight - Single", duration: "4:12", durationSeconds: 252 },
    ],
  },
];

const allTracks = albums.flatMap(album => album.tracks);

type ViewMode = "library" | "albums" | "album-detail";

const ITunesPlayer = ({ isOpen, onClose }: ITunesPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(allTracks[0]);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<ViewMode>("library");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const displayedTracks = selectedAlbum ? selectedAlbum.tracks : allTracks;

  useEffect(() => {
    if (isOpen && windowRef.current) {
      const windowWidth = 900;
      const windowHeight = 550;
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
    const currentIndex = displayedTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % displayedTracks.length;
    setCurrentTrack(displayedTracks[nextIndex]);
    setProgress(0);
  };

  const handlePrev = () => {
    const currentIndex = displayedTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? displayedTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(displayedTracks[prevIndex]);
    setProgress(0);
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setViewMode("album-detail");
  };

  const handleBackToLibrary = () => {
    setSelectedAlbum(null);
    setViewMode("library");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.floor((progress / 100) * currentTrack.durationSeconds);
  const currentAlbum = albums.find(a => a.tracks.some(t => t.id === currentTrack.id));

  if (!isOpen) return null;

  return (
    <div 
      ref={windowRef}
      className={`fixed z-30 ${isClosing ? 'animate-window-close' : 'animate-window-open'} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-[900px] rounded-window window-shadow overflow-hidden border border-[hsl(0_0%_0%/0.2)]">
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
                {/* Album Art */}
                <div className={`w-12 h-12 rounded bg-gradient-to-br ${currentAlbum?.color || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg`}>
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

        <div className="flex h-[420px]">
          {/* Sidebar */}
          <div className="w-48 bg-[hsl(220_20%_14%)] border-r border-[hsl(0_0%_0%/0.3)] py-4">
            <div className="px-4 mb-4">
              <h3 className="text-[10px] uppercase tracking-wider text-itunes-muted font-semibold mb-2">Library</h3>
              <button 
                onClick={handleBackToLibrary}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${viewMode === 'library' ? 'bg-itunes-accent/30 text-itunes-text' : 'text-itunes-muted hover:text-itunes-text'}`}
              >
                <ListMusic className="w-4 h-4" />
                All Songs
              </button>
              <button 
                onClick={() => { setViewMode("albums"); setSelectedAlbum(null); }}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${viewMode === 'albums' ? 'bg-itunes-accent/30 text-itunes-text' : 'text-itunes-muted hover:text-itunes-text'}`}
              >
                <Disc className="w-4 h-4" />
                Albums
              </button>
            </div>

            <div className="px-4">
              <h3 className="text-[10px] uppercase tracking-wider text-itunes-muted font-semibold mb-2">Albums & Singles</h3>
              <div className="space-y-1">
                {albums.map((album) => (
                  <button 
                    key={album.id}
                    onClick={() => handleAlbumSelect(album)}
                    className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors text-left ${selectedAlbum?.id === album.id ? 'bg-itunes-accent/30 text-itunes-text' : 'text-itunes-muted hover:text-itunes-text'}`}
                  >
                    <div className={`w-6 h-6 rounded bg-gradient-to-br ${album.color} flex items-center justify-center flex-shrink-0`}>
                      <Music className="w-3 h-3 text-white" />
                    </div>
                    <span className="truncate">{album.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-gradient-to-b from-[hsl(220_15%_18%)] to-[hsl(220_20%_12%)] overflow-auto">
            {viewMode === "albums" ? (
              /* Albums Grid View */
              <div className="p-6">
                <h2 className="text-xl font-medium text-itunes-text mb-6">Albums & Singles</h2>
                <div className="grid grid-cols-3 gap-6">
                  {albums.map((album) => (
                    <button 
                      key={album.id}
                      onClick={() => handleAlbumSelect(album)}
                      className="group text-left"
                    >
                      <div className={`aspect-square rounded-lg bg-gradient-to-br ${album.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <Music className="w-16 h-16 text-white/80" />
                      </div>
                      <h3 className="text-sm font-medium text-itunes-text mt-3 truncate">{album.name}</h3>
                      <p className="text-xs text-itunes-muted">{album.year} · {album.tracks.length} {album.tracks.length === 1 ? 'song' : 'songs'}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Track List View */
              <>
                {selectedAlbum && (
                  <div className="p-4 border-b border-[hsl(0_0%_100%/0.1)] flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${selectedAlbum.color} flex items-center justify-center shadow-lg`}>
                      <Music className="w-10 h-10 text-white/80" />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-itunes-text">{selectedAlbum.name}</h2>
                      <p className="text-sm text-itunes-muted">{selectedAlbum.year} · {selectedAlbum.tracks.length} {selectedAlbum.tracks.length === 1 ? 'song' : 'songs'}</p>
                    </div>
                  </div>
                )}
                
                {/* Header */}
                <div className="sticky top-0 grid grid-cols-[40px_1fr_150px_80px] gap-2 px-4 py-2 bg-[hsl(0_0%_0%/0.3)] border-b border-[hsl(0_0%_100%/0.1)] text-xs text-itunes-muted uppercase tracking-wider">
                  <span></span>
                  <span>Name</span>
                  <span>Album</span>
                  <span className="text-right">Time</span>
                </div>
                
                {/* Tracks */}
                {displayedTracks.map((track, index) => (
                  <div 
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className={`
                      grid grid-cols-[40px_1fr_150px_80px] gap-2 px-4 py-2 cursor-pointer
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
                    <span className="text-sm truncate">{track.album}</span>
                    <span className="text-sm text-right">{track.duration}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[hsl(220_20%_10%)] px-4 py-2 flex items-center justify-between border-t border-[hsl(0_0%_0%/0.3)]">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-itunes-muted hover:text-itunes-text cursor-pointer transition-colors" />
            <Repeat className="w-4 h-4 text-itunes-muted hover:text-itunes-text cursor-pointer transition-colors" />
          </div>
          <span className="text-xs text-itunes-muted">{displayedTracks.length} {displayedTracks.length === 1 ? 'song' : 'songs'}</span>
        </div>
      </div>
    </div>
  );
};

export default ITunesPlayer;
