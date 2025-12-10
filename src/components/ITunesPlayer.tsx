import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music, Disc, ListMusic } from "lucide-react";
import WindowChrome from "./WindowChrome";
import { albums, type Album, type Track } from "@/data/albums";
import { convertYouTubeUrl } from "@/lib/storage";

interface ITunesPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

type ViewMode = "library" | "albums" | "album-detail";

const ITunesPlayer = ({ isOpen, onClose, isMinimized = false, onMinimize, onRestore, onFocus, zIndex = 30 }: ITunesPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [volume, setVolume] = useState(70);
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
  const [viewMode, setViewMode] = useState<ViewMode>("albums");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allTracks = albums.flatMap(album => album.tracks);
  const displayedTracks = selectedAlbum ? selectedAlbum.tracks : allTracks;

  // Set first track as current if none selected
  useEffect(() => {
    if (allTracks.length > 0 && !currentTrack) {
      setCurrentTrack(allTracks[0]);
    }
  }, [allTracks.length]);

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

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // Stop any current playback
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = ''; // Clear src first to prevent errors
      
      if (currentTrack.fileUrl) {
        // Handle imported assets (from Vite), data URLs, and http/https URLs
        // Vite imports return URLs like "/src/assets/file.mp3" or absolute URLs
        const isValidUrl = typeof currentTrack.fileUrl === 'string' && 
          (currentTrack.fileUrl.startsWith('data:') || 
           currentTrack.fileUrl.startsWith('/') || 
           currentTrack.fileUrl.startsWith('http')) &&
          !currentTrack.fileUrl.startsWith('blob:');
        
        if (isValidUrl) {
          console.log('Loading audio for track:', currentTrack.title);
          
          // Small delay to ensure previous load is cleared
          setTimeout(() => {
            if (audioRef.current && currentTrack && currentTrack.fileUrl) {
              audioRef.current.src = currentTrack.fileUrl;
              audioRef.current.load();
              setProgress(0);
              
              // Log when audio is ready and update duration if available
              audioRef.current.addEventListener('loadedmetadata', () => {
                console.log('✅ Audio metadata loaded for:', currentTrack.title);
                if (audioRef.current && audioRef.current.duration) {
                  const durationSeconds = Math.floor(audioRef.current.duration);
                  const mins = Math.floor(durationSeconds / 60);
                  const secs = durationSeconds % 60;
                  console.log(`Track duration: ${mins}:${secs.toString().padStart(2, '0')}`);
                }
              }, { once: true });
              
              audioRef.current.addEventListener('error', (e) => {
                console.error('❌ Audio load error for:', currentTrack.title, e);
              }, { once: true });
            }
          }, 50);
        } else {
          // Invalid URL (blob or other) - clear it silently
          if (typeof currentTrack.fileUrl === 'string' && currentTrack.fileUrl.startsWith('blob:')) {
            console.warn('❌ Blob URL detected for track:', currentTrack.title, '- Please re-upload the file.');
          } else {
            console.warn('❌ Invalid audio URL for track:', currentTrack.title);
          }
        }
      } else {
        console.warn('⚠️ No audio file for track:', currentTrack.title);
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    
    if (isPlaying) {
      if (currentTrack.fileUrl && audio.src) {
        // Wait for audio to be ready before playing
        const playAudio = () => {
          if (!audio.src || audio.readyState === 0) {
            // No valid source or not loaded yet
            setIsPlaying(false);
            return;
          }
          
          audio.play().catch(err => {
            // Ignore AbortError and NotAllowedError (user interaction required)
            if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
              // These are expected - don't log or change state
              return;
            }
            // Only log unexpected errors
            if (err.name !== 'NotSupportedError') {
              console.error('Error playing audio:', err);
            }
            setIsPlaying(false);
          });
        };

        if (audio.readyState >= 2) {
          // HAVE_CURRENT_DATA or higher - safe to play
          playAudio();
        } else {
          // Wait for canplay event
          const handleCanPlay = () => {
            playAudio();
            audio.removeEventListener('canplay', handleCanPlay);
          };
          audio.addEventListener('canplay', handleCanPlay);
          
          return () => {
            audio.removeEventListener('canplay', handleCanPlay);
          };
        }
      } else if (!currentTrack.fileUrl) {
        // Simulate playback if no file
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              // Auto-advance to next track
              const currentIndex = displayedTracks.findIndex(t => t.id === currentTrack.id);
              const nextIndex = (currentIndex + 1) % displayedTracks.length;
              setCurrentTrack(displayedTracks[nextIndex]);
              return 0;
            }
            return prev + (100 / currentTrack.durationSeconds);
          });
        }, 1000);
      }
    } else {
      if (currentTrack.fileUrl && audio.src) {
        audio.pause();
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack, displayedTracks]);

  // Update progress from audio element (only when not scrubbing)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isScrubbing) return;

    const updateProgress = () => {
      if (audio.duration && currentTrack && !isScrubbing) {
        const percent = (audio.currentTime / audio.duration) * 100;
        setProgress(percent);
      }
    };

    const handleTimeUpdate = () => updateProgress();
    const handleEnded = () => {
      if (currentTrack) {
        const currentIndex = displayedTracks.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % displayedTracks.length;
        setCurrentTrack(displayedTracks[nextIndex]);
        setProgress(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, displayedTracks, isScrubbing]);

  // Handle progress bar scrubbing
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack || !audioRef.current.duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newTime = (percent / 100) * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(percent);
    setScrubTime(Math.floor(newTime));
    setTimeout(() => setScrubTime(null), 100); // Reset after a moment
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack || !audioRef.current.duration) return;
    
    setIsScrubbing(true);
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    
    const updateScrub = (clientX: number) => {
      const clickX = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      const newTime = (percent / 100) * audioRef.current.duration;
      
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setProgress(percent);
        setScrubTime(Math.floor(newTime));
      }
    };
    
    updateScrub(e.clientX);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateScrub(moveEvent.clientX);
    };
    
    const handleMouseUp = () => {
      setIsScrubbing(false);
      setScrubTime(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
      setSavedSize({ width: 900, height: 550 });
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    if (!currentTrack) return;
    const currentIndex = displayedTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % displayedTracks.length;
    setCurrentTrack(displayedTracks[nextIndex]);
    setProgress(0);
  };

  const handlePrev = () => {
    if (!currentTrack) return;
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

  // Calculate current time from progress or audio element
  const currentTime = scrubTime !== null 
    ? scrubTime 
    : (currentTrack ? Math.floor((progress / 100) * currentTrack.durationSeconds) : 0);
  const currentAlbum = currentTrack ? albums.find(a => a.tracks.some(t => t.id === currentTrack.id)) : null;

  if (!isOpen || isMinimized) return null;

  if (albums.length === 0) {
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
          style={{ width: savedSize.width, height: savedSize.height }}
        >
          <div 
            onMouseDown={handleMouseDown}
            className={isMaximized ? '' : `cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            <WindowChrome 
              title="iTunes" 
              onClose={handleClose}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
            />
          </div>
          <div className="flex items-center justify-center h-full bg-gradient-to-b from-[hsl(220_15%_18%)] to-[hsl(220_20%_12%)]">
            <div className="text-center">
              <Music className="w-16 h-16 text-itunes-muted mx-auto mb-4" />
              <p className="text-itunes-text text-lg mb-2">No music yet</p>
              <p className="text-itunes-muted text-sm">Add albums and tracks in the admin panel</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const windowWidth = isMaximized ? window.innerWidth : savedSize.width;
  const windowHeight = isMaximized ? window.innerHeight : savedSize.height;

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
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
        {/* Draggable Title Bar */}
        <div 
          onMouseDown={handleMouseDown}
          className={isMaximized ? '' : `cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          <WindowChrome 
            title="iTunes" 
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
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
                <div className={`w-12 h-12 rounded bg-gradient-to-br ${currentAlbum?.color || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg overflow-hidden relative`}>
                  {(currentAlbum?.coverArt || currentTrack?.albumArt) ? (
                    <img 
                      src={currentTrack?.albumArt || currentAlbum?.coverArt} 
                      alt={currentAlbum?.name || currentTrack?.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!currentAlbum?.coverArt && !currentTrack?.albumArt) && (
                    <span className="text-white text-lg font-bold absolute">♪</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-itunes-text truncate">{currentTrack?.title || "No track selected"}</p>
                  <p className="text-xs text-itunes-muted truncate">{currentTrack ? `${currentTrack.artist} — ${currentTrack.album}` : ""}</p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-itunes-muted w-8">{formatTime(currentTime)}</span>
                    <div 
                      className="flex-1 h-1 bg-[hsl(var(--progress-bg))] rounded-full overflow-hidden cursor-pointer relative group"
                      onClick={handleProgressClick}
                      onMouseDown={handleProgressMouseDown}
                    >
                      <div 
                        className="h-full bg-[hsl(var(--progress-fill))] rounded-full transition-all duration-200"
                        style={{ width: `${progress}%`, transition: isScrubbing ? 'none' : 'width 0.1s linear' }}
                      />
                      {/* Hover indicator */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[hsl(var(--progress-fill))] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                      />
                    </div>
                    <span className="text-[10px] text-itunes-muted w-8 text-right">{currentTrack?.duration || "0:00"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-itunes-muted" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  setVolume(newVolume);
                  if (audioRef.current) {
                    audioRef.current.volume = newVolume / 100;
                  }
                }}
                className="w-20 h-1 bg-[hsl(var(--progress-bg))] rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(var(--progress-fill)) 0%, hsl(var(--progress-fill)) ${volume}%, hsl(var(--progress-bg)) ${volume}%, hsl(var(--progress-bg)) 100%)`
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex" style={{ height: isMaximized ? `calc(100vh - 120px)` : '420px' }}>
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
                    <div className={`w-6 h-6 rounded bg-gradient-to-br ${album.color} flex items-center justify-center flex-shrink-0 overflow-hidden relative`}>
                      {album.coverArt ? (
                        <img 
                          src={album.coverArt} 
                          alt={album.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!album.coverArt && (
                        <Music className="w-3 h-3 text-white absolute" />
                      )}
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
                      <div className={`aspect-square rounded-lg bg-gradient-to-br ${album.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden relative`}>
                        {album.coverArt ? (
                          <img 
                            src={album.coverArt} 
                            alt={album.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {!album.coverArt && (
                          <Music className="w-16 h-16 text-white/80 absolute" />
                        )}
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
                    <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${selectedAlbum.color} flex items-center justify-center shadow-lg overflow-hidden relative`}>
                      {selectedAlbum.coverArt ? (
                        <img 
                          src={selectedAlbum.coverArt} 
                          alt={selectedAlbum.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!selectedAlbum.coverArt && (
                        <Music className="w-10 h-10 text-white/80 absolute" />
                      )}
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
                      ${currentTrack && currentTrack.id === track.id 
                        ? 'bg-itunes-accent/30 text-itunes-text' 
                        : 'text-itunes-muted hover:bg-[hsl(0_0%_100%/0.05)]'
                      }
                      transition-colors
                    `}
                  >
                    <span className="text-sm text-center">
                      {currentTrack && currentTrack.id === track.id && isPlaying ? (
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
    </>
  );
};

export default ITunesPlayer;
