// "use client";

// import { useEffect, useRef } from "react";
// import { initDraw } from "../draw";

// export function Canvas({ roomId,socket }: { roomId: string;socket:WebSocket}) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const socketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
    
//     const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNiZTNhYy0yMzI3LTQ2NzUtYjBhMS05MzkxM2E5YzhmMmQiLCJpYXQiOjE3NDM3NjkyMDF9.mTgnM70Y1iP-qPiq6fi_3Bqum1xGaSAoTJYeu78VjQY";
//     console.log(`Connecting to: ws://localhost:8080?token=${token}`);
//     const socket = new WebSocket(`ws://localhost:8080?token=${token}`);

//     socketRef.current = socket;

//     socket.onopen = () => {
//       console.log("WebSocket connected");
//       if (canvasRef.current) {
//         initDraw(canvasRef.current, roomId, socket);
//       }
//     };
 

//     socket.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     return () => {
//       socket.close();
//     };
//   }, [roomId,socket]);

//   return (
//     <div>
//       <canvas ref={canvasRef} width={2000} height={2000}></canvas>
//     </div>
//   );
// }
// // "use client";

// // import { useEffect, useRef } from "react";
// // import { initDraw } from "../draw";

// // export function Canvas({ roomId }: { roomId: string }) {
// //   const canvasRef = useRef<HTMLCanvasElement>(null);
// //   const socketRef = useRef<WebSocket | null>(null);

// //   useEffect(() => {
// //     const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
// //     const socket = new WebSocket(`ws://localhost:8080?token=${token}`);

// //     socketRef.current = socket;

// //     socket.onopen = () => {
// //       if (canvasRef.current) {
// //         initDraw(canvasRef.current, roomId, socket);
// //       }
// //     };

// //     socket.onerror = (err) => {
// //       console.error("WebSocket error:", err);
// //     };

// //     return () => {
// //       socket.close();
// //     };
// //   }, [roomId]);

// //   return (
// //     <div>
// //       <canvas ref={canvasRef} width={2000} height={2000}></canvas>
// //     </div>
// //   );
// // }
// File: components/Canvas.tsx
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
import {ChatRoomClient} from "../../../web/components/ChatRoomClient"

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
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  // 1️⃣ On mount: create the Game instance and store it
  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);

    // cleanup on unmount
    return () => {
      g.destroy();
    };
  }, [roomId, socket]);

  // 2️⃣ Whenever selectedTool changes, update the Game
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
        
      }}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: "block" }}
      />
      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
      />
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
        left:  "50%",
        transform:"translate(-50%,-50%)",
       zIndex:1000
      }}
    >
      <div className="flex gap-2 items-center bg-white rounded-3xl ">
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
