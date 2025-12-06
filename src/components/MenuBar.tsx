import { Apple, Wifi, Battery, Search } from "lucide-react";

const MenuBar = () => {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-menubar glass-effect border-b border-border/30 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-5">
        <Apple className="w-4 h-4 text-card-foreground" />
        <span className="text-sm font-semibold text-card-foreground">Finder</span>
        <span className="text-sm text-card-foreground/80">File</span>
        <span className="text-sm text-card-foreground/80">Edit</span>
        <span className="text-sm text-card-foreground/80">View</span>
        <span className="text-sm text-card-foreground/80">Go</span>
        <span className="text-sm text-card-foreground/80">Window</span>
        <span className="text-sm text-card-foreground/80">Help</span>
      </div>
      <div className="flex items-center gap-4">
        <Battery className="w-5 h-5 text-card-foreground/80" />
        <Wifi className="w-4 h-4 text-card-foreground/80" />
        <Search className="w-4 h-4 text-card-foreground/80" />
        <span className="text-sm text-card-foreground/80">{currentTime}</span>
      </div>
    </div>
  );
};

export default MenuBar;
