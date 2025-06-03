"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { HTTP_BACKEND } from "@/config";
import Link from "next/link";
// Fonts
import { Poppins, Lobster } from "next/font/google";

// Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn } from "lucide-react";

// Load fonts
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

const createRoom = async () => {
  try {
    const response = await fetch(`${HTTP_BACKEND}/room`, {
      method: "POST",
    });
    const data = await response.json();
    console.log("Fetch room creation response:", data);
    if (!data.roomSlug) {
      alert("Room creation failed: no roomSlug received");
      return;
    }
    router.push(`/canvas/${data.roomSlug}?guest=true`);
  } catch (error) {
    console.error("Create room fetch error:", error);
    alert("Failed to create room.");
  }
};



  const joinRoom = () => {
    const slug = joinSlug.trim();
    if (slug) {
      router.push(`/canvas/${slug}?guest=true`);
    } else {
      alert("Please enter a valid room ID.");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg- px-4 ${poppins.className}`}
    >
      <div className="flex flex-col items-center justify-center px-4 rounded-lg w-full">
        <h1
          className={`text-5xl mt-6 md:text-6xl text-black mb-8 drop-shadow-lg ${lobster.className}`}
        >
          🎨 SketchAlot
        </h1>

        <div className="relative max-w-5xl w-full">
          {/* Glass Effect Background */}
          <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
            {/* Create Room */}
            <Card className="bg-white/80 backdrop-blur-md border border-pink-200 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-pink-700">
                  🎨 Create Room
                </CardTitle>
                <CardDescription>
                  Start a collaborative sketch session instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={createRoom}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Room
                </Button>
              </CardContent>
              <CardFooter className="justify-center text-muted-foreground text-sm">
                No login needed. Instant start.
              </CardFooter>
            </Card>

            {/* Join Room */}
            <Card className="bg-white/80 backdrop-blur-md border border-purple-200 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-700">
                  🔗 Join Room
                </CardTitle>
                <CardDescription>
                  Join a session using a shared slug.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-id">Room Slug</Label>
                  <Input
                    id="room-id"
                    placeholder="e.g. vibrant-panthers-42"
                    value={joinSlug}
                    onChange={(e) => setJoinSlug(e.target.value)}
                  />
                </div>
                <Button
                  onClick={joinRoom}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </Button>
              </CardContent>
              <CardFooter className="justify-center text-muted-foreground text-sm">
                Cross-platform supported. No sign-in required.
              </CardFooter>
            </Card>
          </div>

          {/* Sign In / Sign Up */}
          <div className="flex justify-center mt-4">
            <Card className="bg-white/90 backdrop-blur-md px-6 py-4 border border-indigo-200 shadow-md flex flex-row items-center gap-6">
            <Link href='/signin'>
              <Button
                variant="ghost"
                className="text-pink-700 hover:bg-pink-100"
              >
                Sign In
              </Button>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href='/signup'>
              <Button
                variant="ghost"
                className="text-purple-700 hover:bg-purple-100"
              >
                Sign Up
              </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
