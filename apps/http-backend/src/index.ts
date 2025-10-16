require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://sketchalot-frontend.vercel.app"
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Simple room creation endpoint
app.post("/room", (req, res) => {
  const roomSlug = randomBytes(4).toString("hex");
  res.json({ roomSlug });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "HTTP Backend is running",
    timestamp: new Date().toISOString()
  });
});

// Simple room info endpoint
app.get("/room/:slug", (req, res) => {
  const { slug } = req.params;
  res.json({
    slug,
    message: "Room exists (managed by WebSocket server)",
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HTTP Backend running on port ${PORT}`);
  console.log(`📝 Simple room creation endpoint: POST /room`);
  console.log(`🏥 Health check: GET /health`);
});
