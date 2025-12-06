import { Music, Folder, Settings, Mail, Globe } from "lucide-react";
import { useState } from "react";

interface DockProps {
  onOpeniTunes: () => void;
  isItunesOpen: boolean;
}

const Dock = ({ onOpeniTunes, isItunesOpen }: DockProps) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [bouncingIcon, setBouncingIcon] = useState<string | null>(null);

  const handleIconClick = (iconName: string, action?: () => void) => {
    setBouncingIcon(iconName);
    setTimeout(() => setBouncingIcon(null), 500);
    if (action) action();
  };

  const dockItems = [
    { 
      name: "iTunes", 
      icon: Music, 
      color: "from-pink-500 to-orange-400",
      action: onOpeniTunes,
      isActive: isItunesOpen
    },
    { name: "Finder", icon: Folder, color: "from-blue-400 to-blue-600" },
    { name: "Safari", icon: Globe, color: "from-blue-300 to-blue-500" },
    { name: "Mail", icon: Mail, color: "from-blue-400 to-sky-500" },
    { name: "Settings", icon: Settings, color: "from-gray-400 to-gray-600" },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-end gap-2 px-3 py-2 rounded-2xl bg-[hsl(0_0%_100%/0.25)] dock-glass border border-[hsl(0_0%_100%/0.3)]">
        {dockItems.map((item) => (
          <div 
            key={item.name}
            className="relative group"
            onMouseEnter={() => setHoveredIcon(item.name)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            {hoveredIcon === item.name && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card-foreground/80 text-card text-xs rounded whitespace-nowrap">
                {item.name}
              </div>
            )}
            <button
              onClick={() => handleIconClick(item.name, item.action)}
              className={`
                w-12 h-12 rounded-xl bg-gradient-to-b ${item.color} 
                flex items-center justify-center
                transition-transform duration-150 ease-out
                hover:scale-125 hover:-translate-y-2
                ${bouncingIcon === item.name ? 'animate-dock-bounce' : ''}
                shadow-lg
              `}
            >
              <item.icon className="w-7 h-7 text-white" />
            </button>
            {item.isActive && (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dock;
