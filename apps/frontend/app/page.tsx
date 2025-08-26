"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";
import { Poppins, Lobster } from "next/font/google";

// Load fonts
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function App() {
  const router = useRouter();
  const [joinSlug, setJoinSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Room created:", data);
      if (!data.roomSlug) {
        alert("Room creation failed");
        return;
      }
      router.push(`/canvas/${data.roomSlug}?guest=true`);
    } catch (error) {
      console.error("Create room error:", error);
      alert("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = () => {
    const slug = joinSlug.trim();
    if (slug) {
      setIsJoining(true);
      router.push(`/canvas/${slug}?guest=true`);
    } else {
      alert("Please enter a room ID");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 ${poppins.className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold text-white mb-2 drop-shadow-lg ${lobster.className}`}>
            🎨 SketchAlot
          </h1>
          <p className="text-white/80 text-sm">Collaborative Drawing Made Simple</p>
        </div>
        
        <div className="space-y-6">
          {/* Create Room Button */}
          <button
            onClick={createRoom}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              "✨ Create New Room"
            )}
          </button>
          
          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-white/30"></div>
            <span className="px-4 text-white/60 text-sm">or</span>
            <div className="flex-1 border-t border-white/30"></div>
          </div>
          
          {/* Join Room Section */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter room ID to join..."
              value={joinSlug}
              onChange={(e) => setJoinSlug(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
              onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={isJoining || !joinSlug.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Joining...
                </div>
              ) : (
                "🚀 Join Room"
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-xs">
            No signup required • Instant collaboration • Cross-platform
          </p>
        </div>
      </div>
    </div>
  );
}
