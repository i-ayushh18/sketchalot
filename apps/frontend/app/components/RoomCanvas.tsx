"use client";

import { useEffect, useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";
import { CollaborativeChat } from "./CollaborativeChat";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const url = WS_URL.startsWith("http")
      ? WS_URL.replace(/^http/, "ws")
      : WS_URL;
    
    const ws = new WebSocket(`${url}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    };

    ws.onerror = (event: Event | ErrorEvent) => {
      // Silently handle WebSocket errors to prevent console spam
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  const handleJoinRoom = () => {
    if (!username.trim() || !socket) return;
    
    const joinPayload = JSON.stringify({
      type: "join_room",
      roomSlug: roomId,
      user: username.trim()
    });

    socket.send(joinPayload);
    setShowUsernameModal(false);
  };

  if (!connected || !socket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Collaborative Board</h2>
          <p className="text-gray-600">Establishing real-time connection...</p>
        </div>
      </div>
    );
  }

  if (showUsernameModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Collaborative Board
            </h2>
            <p className="text-gray-600">Enter your name to start collaborating</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                autoFocus
              />
            </div>
            
            <button
              onClick={handleJoinRoom}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Join Room
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Room Code</p>
            <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block">
              <span className="font-mono text-gray-700 font-semibold">{roomId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Room Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
    <div>
                <h1 className="text-2xl font-bold text-gray-900">Collaborative Drawing</h1>
                <p className="text-sm text-gray-500">Real-time drawing collaboration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Room:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{roomId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">User:</span>
                <span className="font-medium text-gray-700">{username}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showChat 
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{showChat ? "Hide Chat" : "Show Chat"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <Canvas roomId={roomId} socket={socket} user={username} />

      {/* Collaborative Chat */}
      <CollaborativeChat
        socket={socket}
        roomSlug={roomId}
        isOpen={showChat}
        onToggle={() => setShowChat(!showChat)}
      />
    </div>
  );
}
