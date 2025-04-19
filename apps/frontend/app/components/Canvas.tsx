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
 import { initDraw } from "../draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "../draw/game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, roomId, socket);
        }
    }, [canvasRef]);
    

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
}

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div style={{
            position: "fixed",
            top: 10,
            left: 10
        }}>
            <div className="flex gap-t">
                <IconButton 
                    onClick={() => {
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
            </div>
        </div>
}