"use client";
import { useState } from "react";
import { Sparkles, LogIn } from "lucide-react";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async () => {
    const url = isSignin
      ? "http://localhost:3001/signin"
      : "http://localhost:3001/signup";

    const payload = isSignin
      ? { username: email, password }
      : { username: email, password, name };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      if (isSignin) {
        localStorage.setItem("token", data.token);
        console.log("Signed in:", data.token);
      } else {
        console.log("Signed up:", data.userId);
      }

      // Navigate to canvas or dashboard
    } catch (e) {
      setError("Network error");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 px-4">
      <div className="relative max-w-sm w-full p-8 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
          {isSignin ? "Welcome Back 👋" : "Join SketchAlot 🎨"}
        </h2>

        <div className="space-y-4">
          {!isSignin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-pink-300 bg-white/80 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-purple-300 bg-white/80 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 bg-white/80 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
        )}

        <div className="pt-6">
          <button
            onClick={handleAuth}
            className={`w-full flex justify-center items-center gap-2 ${
              isSignin
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-pink-600 hover:bg-pink-700"
            } text-white font-semibold py-2 rounded-lg transition duration-200`}
          >
            {isSignin ? (
              <>
                <LogIn className="h-5 w-5" /> Sign In
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Sign Up
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
