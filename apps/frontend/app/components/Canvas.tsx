import { JSX, useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  Slash,
  ArrowRight,
  Eraser,
  Users,
  Trash2,
  Download,
  Share2,
  Copy,
} from "lucide-react";
import { Game } from "../draw/game";

export type Tool =
  | "circle"
  | "rect"
  | "pencil"
  | "slash"
  | "arrowright"
  | "eraser";

export function Canvas({
  roomId,
  socket,
  user,
}: {
  socket: WebSocket;
  roomId: string;
  user: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [userCount, setUserCount] = useState(0);
  const [lastShapeTime, setLastShapeTime] = useState<number>(0);

  // On mount: create the Game instance and store it
  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket, user);
    setGame(g);

    // cleanup on unmount
    return () => {
      g.destroy();
    };
  }, [roomId, socket, user]);

  // Handle WebSocket messages for user count and other updates
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "room_data":
            if (data.roomSlug === roomId) {
              setUserCount(data.userCount || 0);
            }
            break;
            
          case "user_joined":
          case "user_left":
            if (data.roomSlug === roomId) {
              setUserCount(data.userCount || 0);
            }
            break;
            
          case "shape":
            // Temporarily disabled shape feedback to prevent false notifications
            // if (data.roomSlug === roomId && data.shape && data.shape.userId && data.shape.userId !== user) {
            //   setLastShapeTime(Date.now());
            // }
            break;
        }
      } catch (error) {
        // Silently handle message parsing errors
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, roomId, user]);

  // Whenever selectedTool changes, update the Game
  useEffect(() => {
    if (game) {
      console.log("📌 Updating Game tool to:", selectedTool);
      game.setTool(selectedTool);
    }
  }, [selectedTool, game]);

  const handleClearCanvas = () => {
    if (!socket || !confirm("Are you sure you want to clear the entire canvas? This action cannot be undone.")) {
      return;
    }

    socket.send(JSON.stringify({
      type: "clear_canvas",
      roomSlug: roomId
    }));
  };

  const handleDownloadCanvas = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `sketch-${roomId}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleShareRoom = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="h-screen bg-gray-50 relative overflow-hidden">
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="block cursor-crosshair"
      />
      
      {/* Top Layer - Main Toolbar */}
      <MainToolbar 
        selectedTool={selectedTool} 
        setSelectedTool={setSelectedTool} 
        onClearCanvas={handleClearCanvas}
      />
      
      {/* Top Layer - Secondary Toolbar */}
      <SecondaryToolbar 
        onDownload={handleDownloadCanvas}
        onShare={handleShareRoom}
      />
      
      {/* Top Layer - User Count Badge */}
      <UserCountBadge userCount={userCount} />
      
      {/* Bottom Layer - Room Info */}
      <RoomInfo roomId={roomId} />
      
      {/* Overlay Layer - Shape Creation Feedback */}
      {lastShapeTime > 0 && Date.now() - lastShapeTime < 2000 && (
        <ShapeFeedback />
      )}
    </div>
  );
}

function MainToolbar({
  selectedTool,
  setSelectedTool,
  onClearCanvas,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  onClearCanvas: () => void;
}) {
  const tools: { tool: Tool; icon: JSX.Element; label: string; shortcut?: string }[] = [
    { tool: "pencil", icon: <Pencil size={20} />, label: "Pencil", shortcut: "P" },
    { tool: "rect", icon: <RectangleHorizontalIcon size={20} />, label: "Rectangle", shortcut: "R" },
    { tool: "circle", icon: <Circle size={20} />, label: "Circle", shortcut: "C" },
    { tool: "slash", icon: <Slash size={20} />, label: "Line", shortcut: "L" },
    { tool: "arrowright", icon: <ArrowRight size={20} />, label: "Arrow", shortcut: "A" },
    { tool: "eraser", icon: <Eraser size={20} />, label: "Eraser", shortcut: "E" },
  ];

  return (
    <div className="fixed top-6 left-1/2 transform translate-x-8 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 flex items-center gap-2">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map(({ tool, icon, label, shortcut }) => (
            <ToolButton
              key={tool}
              tool={tool}
              icon={icon}
              label={label}
              shortcut={shortcut}
              isSelected={selectedTool === tool}
              onClick={() => setSelectedTool(tool)}
            />
          ))}
        </div>
        
        {/* Divider */}
        <div className="w-px h-8 bg-gray-300 mx-2" />
        
        {/* Clear Canvas Button */}
        <button
          onClick={onClearCanvas}
          className="group relative p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 border-2 border-transparent hover:border-red-200"
          title="Clear Canvas"
        >
          <Trash2 size={20} />
          
                  {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-60">
          Clear Canvas
        </div>
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  tool,
  icon,
  label,
  shortcut,
  isSelected,
  onClick,
}: {
  tool: Tool;
  icon: JSX.Element;
  label: string;
  shortcut?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative p-3 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-blue-100 text-blue-600 shadow-md border-2 border-blue-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-2 border-transparent'
      }`}
      title={`${label} (${shortcut})`}
    >
      {icon}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-60">
        {label}
        {shortcut && <span className="ml-1 text-gray-300">({shortcut})</span>}
      </div>
    </button>
  );
}

function SecondaryToolbar({
  onDownload,
  onShare,
}: {
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <div className="fixed top-20 right-6 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 flex items-center gap-2">
        <button
          onClick={onShare}
          className="group relative p-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 border-2 border-transparent hover:border-gray-200"
          title="Share Room"
        >
          <Share2 size={20} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-60">
            Share Room
          </div>
        </button>
        
        <button
          onClick={onDownload}
          className="group relative p-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 border-2 border-transparent hover:border-gray-200"
          title="Download Canvas"
        >
          <Download size={20} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-60">
            Download Canvas
          </div>
        </button>
      </div>
    </div>
  );
}

function UserCountBadge({ userCount }: { userCount: number }) {
  return (
    <div className="fixed top-20 left-6 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">{userCount}</span>
        </div>
        <span className="text-sm text-gray-500">online</span>
      </div>
    </div>
  );
}

function RoomInfo({ roomId }: { roomId: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <div className="text-gray-500 font-medium">Room ID</div>
            <div className="font-mono text-gray-800 font-semibold">{roomId}</div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              alert("Room ID copied to clipboard!");
            }}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Copy Room ID"
          >
            <Copy size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShapeFeedback() {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <span className="text-green-500 text-sm">✨</span>
        </div>
        <span className="font-medium">Shape created by another user!</span>
      </div>
    </div>
  );
}
