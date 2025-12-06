interface WindowChromeProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const WindowChrome = ({ title, onClose, onMinimize, onMaximize }: WindowChromeProps) => {
  return (
    <div className="flex items-center justify-between h-12 px-4 bg-itunes-gradient rounded-t-window">
      <div className="flex items-center gap-2">
        <button 
          onClick={onClose}
          className="traffic-light traffic-light-red group relative"
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-red-900 opacity-0 group-hover:opacity-100">×</span>
        </button>
        <button 
          onClick={onMinimize}
          className="traffic-light traffic-light-yellow group relative"
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-yellow-900 opacity-0 group-hover:opacity-100">−</span>
        </button>
        <button 
          onClick={onMaximize}
          className="traffic-light traffic-light-green group relative"
        >
          <span className="absolute inset-0 flex items-center justify-center text-[8px] text-green-900 opacity-0 group-hover:opacity-100">⤢</span>
        </button>
      </div>
      <span className="text-sm font-medium text-itunes-text/90">{title}</span>
      <div className="w-16" /> {/* Spacer for centering */}
    </div>
  );
};

export default WindowChrome;
