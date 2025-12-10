import { useState } from "react";
import { Music, Globe, FileText } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import ITunesPlayer from "@/components/ITunesPlayer";
import SafariBrowser from "@/components/SafariBrowser";
import TextEdit from "@/components/TextEdit";
import DesktopIcon from "@/components/DesktopIcon";
import lunaBackground from "@/assets/Luna Character Design Sheet.png";

const Index = () => {
  const [isItunesOpen, setIsItunesOpen] = useState(false);
  const [isSafariOpen, setIsSafariOpen] = useState(false);
  const [isTextEditOpen, setIsTextEditOpen] = useState(false);
  const [isItunesMinimized, setIsItunesMinimized] = useState(false);
  const [isSafariMinimized, setIsSafariMinimized] = useState(false);
  const [isTextEditMinimized, setIsTextEditMinimized] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
  
  // Base z-index values
  const baseZIndex = {
    itunes: 30,
    safari: 20,
    textedit: 25,
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
        isItunesOpen={isItunesOpen && !isItunesMinimized}
        isSafariOpen={isSafariOpen && !isSafariMinimized}
        isTextEditOpen={isTextEditOpen && !isTextEditMinimized}
      />
    </div>
  );
};

export default Index;
