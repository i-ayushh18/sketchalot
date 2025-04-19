"use client";
import { useState } from "react";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async () => {
    const url = isSignin ? "http://localhost:3001/signin" : "http://localhost:3001/signup";

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
        // Save token for future requests
        localStorage.setItem("token", data.token);
        console.log("Signed in:", data.token);
      } else {
        console.log("Signed up:", data.userId);
      }

      // Redirect or update UI here (e.g., go to dashboard)
    } catch (e) {
      setError("Network error");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="p-8 m-4 bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {isSignin ? "Welcome Back 👋" : "Create an Account"}
        </h2>

        <div className="space-y-4">
          {!isSignin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            />
          )}
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
        </div>

        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}

        <div className="pt-6">
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition duration-200"
            onClick={handleAuth}
          >
            {isSignin ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
