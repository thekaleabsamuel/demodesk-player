import { Music } from "lucide-react";

interface DesktopIconProps {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DesktopIcon = ({ name, icon, onClick }: DesktopIconProps) => {
  return (
    <button
      onClick={onClick}
      onDoubleClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[hsl(0_0%_100%/0.1)] transition-colors group w-20"
    >
      <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-pink-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <span className="text-xs text-foreground font-medium text-center drop-shadow-md">
        {name}
      </span>
    </button>
  );
};

export default DesktopIcon;
