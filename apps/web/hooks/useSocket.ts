import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    
    const protocol = WS_URL.startsWith("http") ? WS_URL.replace(/^http/, "ws") : WS_URL;
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMjViMTI1Yy0wMmI3LTRjOTMtOWVlZi0xN2RiNDcwN2QwNzkiLCJpYXQiOjE3NDg4ODA3Mzl9.4e-unvkNP77SXElC7_BW4bMBFfgBIhrDncPy64EwRn8";
    
    const ws = new WebSocket(`${protocol}?token=${token}`);

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
}
