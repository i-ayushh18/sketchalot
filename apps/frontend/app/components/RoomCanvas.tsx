"use client";

import { useEffect, useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const url = WS_URL.startsWith("http")
      ? WS_URL.replace(/^http/, "ws")
      : WS_URL;

    
    const ws = new WebSocket(`${url}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");

      const joinPayload = JSON.stringify({
        type: "join_room",
        roomSlug: roomId,
      });

      ws.send(joinPayload);
      setConnected(true);
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  if (!connected || !socket) {
    return <div>Connecting to WebSocket...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} user="" />
    </div>
  );
}
