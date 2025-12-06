import { useState } from "react";
import { Music, Globe } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import ITunesPlayer from "@/components/ITunesPlayer";
import SafariBrowser from "@/components/SafariBrowser";
import DesktopIcon from "@/components/DesktopIcon";

const Index = () => {
  const [isItunesOpen, setIsItunesOpen] = useState(false);
  const [isSafariOpen, setIsSafariOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220_40%_25%)] via-[hsl(280_30%_20%)] to-[hsl(320_35%_18%)] overflow-hidden relative">
      {/* Desktop Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_hsl(280_60%_30%)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_hsl(320_50%_25%)_0%,_transparent_50%)]" />
      </div>

      <MenuBar />
      
      {/* Desktop Icons */}
      <div className="absolute top-10 right-4 pt-4 flex flex-col gap-2">
        <DesktopIcon 
          name="iTunes" 
          icon={<Music className="w-8 h-8 text-white" />}
          onClick={() => setIsItunesOpen(true)}
        />
        <DesktopIcon 
          name="Blog" 
          icon={<Globe className="w-8 h-8 text-white" />}
          onClick={() => setIsSafariOpen(true)}
        />
      </div>

      <SafariBrowser 
        isOpen={isSafariOpen} 
        onClose={() => setIsSafariOpen(false)} 
      />

      <ITunesPlayer 
        isOpen={isItunesOpen} 
        onClose={() => setIsItunesOpen(false)} 
      />
      
      <Dock 
        onOpeniTunes={() => setIsItunesOpen(true)}
        onOpenSafari={() => setIsSafariOpen(true)}
        isItunesOpen={isItunesOpen}
        isSafariOpen={isSafariOpen}
      />
    </div>
  );
};

export default Index;
