import { useState } from "react";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import ITunesPlayer from "@/components/ITunesPlayer";

const Index = () => {
  const [isItunesOpen, setIsItunesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220_40%_25%)] via-[hsl(280_30%_20%)] to-[hsl(320_35%_18%)] overflow-hidden relative">
      {/* Desktop Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_hsl(280_60%_30%)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_hsl(320_50%_25%)_0%,_transparent_50%)]" />
      </div>

      <MenuBar />
      
      {/* Desktop Content Area */}
      <div className="pt-12 pb-24 px-8 min-h-screen flex items-center justify-center">
        {!isItunesOpen && (
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl font-light text-foreground/90 mb-4 tracking-tight">
              Welcome
            </h1>
            <p className="text-foreground/60 text-lg">
              Click the iTunes icon in the dock to listen to demos
            </p>
          </div>
        )}
      </div>

      <ITunesPlayer 
        isOpen={isItunesOpen} 
        onClose={() => setIsItunesOpen(false)} 
      />
      
      <Dock 
        onOpeniTunes={() => setIsItunesOpen(true)}
        isItunesOpen={isItunesOpen}
      />
    </div>
  );
};

export default Index;
