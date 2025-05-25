import { JSX, useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  Slash,
  ArrowRight,
  Eraser,
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
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  // On mount: create the Game instance and store it
  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket, user);
    setGame(g);

    // cleanup on unmount
    return () => {
      g.destroy();
    };
  }, [roomId, socket]);

  // Whenever selectedTool changes, update the Game
  useEffect(() => {
    if (game) {
      console.log("📌 Updating Game tool to:", selectedTool);
      game.setTool(selectedTool);
    }
  }, [selectedTool, game]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative", // needed for roomId positioning
      }}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: "block" }}
      />
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      {/* Room ID visible on the screen */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          padding: "8px 12px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          borderRadius: 12,
          fontWeight: "bold",
          zIndex: 1000,
          userSelect: "all", // so user can copy text
          cursor: "text",
        }}
        title="Room ID (click to copy)"
        onClick={() => {
          navigator.clipboard.writeText(roomId);
          alert("Room ID copied to clipboard!");
        }}
      >
        Room ID: {roomId}
      </div>
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  const tools: { tool: Tool; icon: JSX.Element }[] = [
    { tool: "pencil", icon: <Pencil /> },
    { tool: "rect", icon: <RectangleHorizontalIcon /> },
    { tool: "circle", icon: <Circle /> },
    { tool: "slash", icon: <Slash /> },
    { tool: "arrowright", icon: <ArrowRight /> },
    { tool: "eraser", icon: <Eraser /> },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: "5%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
      }}
    >
      <div className="flex gap-2 items-center bg-white rounded-3xl p-2 shadow-lg">
        {tools.map(({ tool, icon }) => (
          <IconButton
            key={tool}
            onClick={() => setSelectedTool(tool)}
            activated={selectedTool === tool}
            icon={icon}
          />
        ))}
      </div>
    </div>
  );
}
