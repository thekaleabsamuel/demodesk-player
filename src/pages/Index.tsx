import { useState } from "react";
import { Music, Globe, FileText } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import ITunesPlayer from "@/components/ITunesPlayer";
import SafariBrowser from "@/components/SafariBrowser";
import TextEdit from "@/components/TextEdit";
import Finder from "@/components/Finder";
import Email from "@/components/Email";
import Settings from "@/components/Settings";
import DesktopIcon from "@/components/DesktopIcon";
import lunaBackground from "@/assets/Luna Character Design Sheet.png";

const Index = () => {
  const [isItunesOpen, setIsItunesOpen] = useState(false);
  const [isSafariOpen, setIsSafariOpen] = useState(false);
  const [isTextEditOpen, setIsTextEditOpen] = useState(false);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isItunesMinimized, setIsItunesMinimized] = useState(false);
  const [isSafariMinimized, setIsSafariMinimized] = useState(false);
  const [isTextEditMinimized, setIsTextEditMinimized] = useState(false);
  const [isFinderMinimized, setIsFinderMinimized] = useState(false);
  const [isEmailMinimized, setIsEmailMinimized] = useState(false);
  const [isSettingsMinimized, setIsSettingsMinimized] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
  
  // Base z-index values
  const baseZIndex = {
    itunes: 30,
    safari: 20,
    textedit: 25,
    finder: 22,
    email: 21,
    settings: 19,
  };
  
  // Calculate z-index based on focus
  const getZIndex = (windowName: string) => {
    if (focusedWindow === windowName) {
      return 50; // Bring focused window to front
    }
    return baseZIndex[windowName as keyof typeof baseZIndex] || 10;
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-white">
      {/* Desktop Background Image */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${lunaBackground})`,
          backgroundSize: '70%'
        }}
      />

      <MenuBar />
      
      {/* Desktop Icons */}
      <div className="absolute top-10 right-4 pt-4 flex flex-col gap-2">
        <DesktopIcon 
          name="iTunes" 
          icon={<Music className="w-8 h-8 text-black" />}
          onClick={() => {
            setIsItunesOpen(true);
            setFocusedWindow('itunes');
          }}
        />
        <DesktopIcon 
          name="Blog" 
          icon={<Globe className="w-8 h-8 text-black" />}
          onClick={() => {
            setIsSafariOpen(true);
            setFocusedWindow('safari');
          }}
        />
        <DesktopIcon 
          name="TextEdit" 
          icon={<FileText className="w-8 h-8 text-black" />}
          onClick={() => {
            setIsTextEditOpen(true);
            setFocusedWindow('textedit');
          }}
        />
      </div>

      <SafariBrowser 
        isOpen={isSafariOpen} 
        onClose={() => {
          setIsSafariOpen(false);
          setIsSafariMinimized(false);
          if (focusedWindow === 'safari') setFocusedWindow(null);
        }}
        isMinimized={isSafariMinimized}
        onMinimize={() => setIsSafariMinimized(true)}
        onRestore={() => {
          setIsSafariMinimized(false);
          setFocusedWindow('safari');
        }}
        onFocus={() => setFocusedWindow('safari')}
        zIndex={getZIndex('safari')}
      />

      <ITunesPlayer 
        isOpen={isItunesOpen} 
        onClose={() => {
          setIsItunesOpen(false);
          setIsItunesMinimized(false);
          if (focusedWindow === 'itunes') setFocusedWindow(null);
        }}
        isMinimized={isItunesMinimized}
        onMinimize={() => setIsItunesMinimized(true)}
        onRestore={() => {
          setIsItunesMinimized(false);
          setFocusedWindow('itunes');
        }}
        onFocus={() => setFocusedWindow('itunes')}
        zIndex={getZIndex('itunes')}
      />

      <TextEdit 
        isOpen={isTextEditOpen} 
        onClose={() => {
          setIsTextEditOpen(false);
          setIsTextEditMinimized(false);
          if (focusedWindow === 'textedit') setFocusedWindow(null);
        }}
        isMinimized={isTextEditMinimized}
        onMinimize={() => setIsTextEditMinimized(true)}
        onRestore={() => {
          setIsTextEditMinimized(false);
          setFocusedWindow('textedit');
        }}
        onFocus={() => setFocusedWindow('textedit')}
        zIndex={getZIndex('textedit')}
      />

      <Finder 
        isOpen={isFinderOpen} 
        onClose={() => {
          setIsFinderOpen(false);
          setIsFinderMinimized(false);
          if (focusedWindow === 'finder') setFocusedWindow(null);
        }}
        isMinimized={isFinderMinimized}
        onMinimize={() => setIsFinderMinimized(true)}
        onRestore={() => {
          setIsFinderMinimized(false);
          setFocusedWindow('finder');
        }}
        onFocus={() => setFocusedWindow('finder')}
        zIndex={getZIndex('finder')}
      />

      <Email 
        isOpen={isEmailOpen} 
        onClose={() => {
          setIsEmailOpen(false);
          setIsEmailMinimized(false);
          if (focusedWindow === 'email') setFocusedWindow(null);
        }}
        isMinimized={isEmailMinimized}
        onMinimize={() => setIsEmailMinimized(true)}
        onRestore={() => {
          setIsEmailMinimized(false);
          setFocusedWindow('email');
        }}
        onFocus={() => setFocusedWindow('email')}
        zIndex={getZIndex('email')}
      />

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => {
          setIsSettingsOpen(false);
          setIsSettingsMinimized(false);
          if (focusedWindow === 'settings') setFocusedWindow(null);
        }}
        isMinimized={isSettingsMinimized}
        onMinimize={() => setIsSettingsMinimized(true)}
        onRestore={() => {
          setIsSettingsMinimized(false);
          setFocusedWindow('settings');
        }}
        onFocus={() => setFocusedWindow('settings')}
        zIndex={getZIndex('settings')}
      />
      
      <Dock 
        onOpeniTunes={() => {
          if (isItunesMinimized) {
            setIsItunesMinimized(false);
            setFocusedWindow('itunes');
          } else {
            setIsItunesOpen(true);
            setFocusedWindow('itunes');
          }
        }}
        onOpenSafari={() => {
          if (isSafariMinimized) {
            setIsSafariMinimized(false);
            setFocusedWindow('safari');
          } else {
            setIsSafariOpen(true);
            setFocusedWindow('safari');
          }
        }}
        onOpenTextEdit={() => {
          if (isTextEditMinimized) {
            setIsTextEditMinimized(false);
            setFocusedWindow('textedit');
          } else {
            setIsTextEditOpen(true);
            setFocusedWindow('textedit');
          }
        }}
        onOpenFinder={() => {
          if (isFinderMinimized) {
            setIsFinderMinimized(false);
            setFocusedWindow('finder');
          } else {
            setIsFinderOpen(true);
            setFocusedWindow('finder');
          }
        }}
        onOpenEmail={() => {
          if (isEmailMinimized) {
            setIsEmailMinimized(false);
            setFocusedWindow('email');
          } else {
            setIsEmailOpen(true);
            setFocusedWindow('email');
          }
        }}
        onOpenSettings={() => {
          if (isSettingsMinimized) {
            setIsSettingsMinimized(false);
            setFocusedWindow('settings');
          } else {
            setIsSettingsOpen(true);
            setFocusedWindow('settings');
          }
        }}
        isItunesOpen={isItunesOpen && !isItunesMinimized}
        isSafariOpen={isSafariOpen && !isSafariMinimized}
        isTextEditOpen={isTextEditOpen && !isTextEditMinimized}
        isFinderOpen={isFinderOpen && !isFinderMinimized}
        isEmailOpen={isEmailOpen && !isEmailMinimized}
        isSettingsOpen={isSettingsOpen && !isSettingsMinimized}
      />
    </div>
  );
};

export default Index;
