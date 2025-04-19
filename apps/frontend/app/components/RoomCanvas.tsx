// // "use client";

// import { useState, useEffect } from "react";
// import { initDraw } from "../draw";
// import { WS_URL } from "@/config";

// export function RoomCanvas({ roomId }: { roomId: string }) {
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNiZTNhYy0yMzI3LTQ2NzUtYjBhMS05MzkxM2E5YzhmMmQiLCJpYXQiOjE3NDM3NjkyMDF9.mTgnM70Y1iP-qPiq6fi_3Bqum1xGaSAoTJYeu78VjQY"; // Replace with actual token

//     const ws = new WebSocket(`${WS_URL}?token=${token}`);

//     ws.onopen = () => {
//       console.log("WebSocket connected");
//       setSocket(ws);
//       setIsConnected(true);

//       const joinMessage = JSON.stringify({
//         type: "join_room",
//         roomId,
//       });
//       ws.send(joinMessage); // Send the join room message
//     };

//     ws.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     ws.onclose = () => {
//       console.warn("WebSocket connection closed");
//       setIsConnected(false);
//     };

//     return () => {
//       ws.close(); // Clean up WebSocket connection when the component unmounts
//     };
//   }, [roomId]);

//   if (!isConnected) {
//     return <div>Connecting to WebSocket...</div>;
//   }

//   return <div>WebSocket Connected! Proceeding with Canvas...</div>;
// }
"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3Njg0NDMwYy04YzNiLTRlZmQtOGFmNS00YzQwMzdmNjJkYzMiLCJpYXQiOjE3MzcyOTg2NjV9.xacFop0s231DoUVeLZormeIbBmIRaXftTVVI6weIqFo`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomSlug:roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}