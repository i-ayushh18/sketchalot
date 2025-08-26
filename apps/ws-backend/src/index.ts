require("dotenv").config();

const { WebSocketServer } = require("ws");
const { randomUUID } = require("crypto");

const port = Number(process.env.PORT || 8080);
const wss = new WebSocketServer({ port });

console.log(`✅ WebSocket server running on port ${port}`);

// Enhanced type definitions
interface User {
  ws: any; // WebSocket instance
  rooms: Set<string>;
  username?: string;
}

interface Room {
  users: Set<string>;
  shapes: any[];
  messages: any[];
  userCount: number;
}

interface WebSocketMessage {
  type: string;
  roomSlug?: string;
  user?: string;
  [key: string]: any;
}

interface ShapeMessage {
  type: "shape";
  shape: any;
  roomSlug: string;
}

interface ChatMessage {
  type: "chat";
  message: string;
  roomSlug: string;
}

interface JoinMessage {
  type: "join" | "join_room";
  roomSlug: string;
  user?: string;
}

// In-memory storage - much faster than database
const rooms = new Map<string, Room>(); // roomSlug -> Room
const users = new Map<string, User>(); // userId -> User

// Clean up disconnected users every 5 minutes
setInterval(() => {
  for (const [userId, user] of users.entries()) {
    if (user.ws.readyState !== 1) { // 1 = OPEN
      // Remove user from all rooms
      for (const roomSlug of user.rooms) {
        const room = rooms.get(roomSlug);
        if (room) {
          room.users.delete(userId);
          room.userCount = room.users.size;
          if (room.users.size === 0) {
            rooms.delete(roomSlug); // Clean up empty rooms
          }
        }
      }
      users.delete(userId);
    }
  }
}, 5 * 60 * 1000);

wss.on("connection", (ws: any, request: any) => {
  const userId = randomUUID();
  const user: User = { ws, rooms: new Set() };
  users.set(userId, user);
  
  console.log(`✅ User ${userId} connected`);

  ws.on("message", (data: any) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const { type, roomSlug, ...payload } = message;

      switch (type) {
        case "join":
        case "join_room": {
          if (!roomSlug) return;
          
          // Create room if it doesn't exist
          if (!rooms.has(roomSlug)) {
            rooms.set(roomSlug, {
              users: new Set(),
              shapes: [],
              messages: [],
              userCount: 0
            });
          }
          
          const room = rooms.get(roomSlug);
          if (room) {
            room.users.add(userId);
            room.userCount = room.users.size;
            user.rooms.add(roomSlug);
            
            // Set username if provided
            if (payload.user) {
              user.username = payload.user;
            }
            
            // Send existing shapes and messages to the new user
            ws.send(JSON.stringify({
              type: "room_data",
              roomSlug,
              shapes: room.shapes,
              messages: room.messages,
              userCount: room.userCount
            }));
            
            // Notify others in the room
            broadcastToRoom(roomSlug, {
              type: "user_joined",
              userId,
              username: user.username || `User-${userId.slice(0, 8)}`,
              roomSlug,
              userCount: room.userCount
            }, userId);
            
            console.log(`📥 User ${user.username || userId} joined room ${roomSlug} (${room.userCount} users)`);
          }
          break;
        }

        case "leave_room": {
          if (!roomSlug) return;
          
          const room = rooms.get(roomSlug);
          if (room) {
            room.users.delete(userId);
            room.userCount = room.users.size;
            user.rooms.delete(roomSlug);
            
            // Clean up empty rooms
            if (room.users.size === 0) {
              rooms.delete(roomSlug);
            } else {
              // Notify others
              broadcastToRoom(roomSlug, {
                type: "user_left",
                userId,
                username: user.username || `User-${userId.slice(0, 8)}`,
                roomSlug,
                userCount: room.userCount
              }, userId);
            }
          }
          
          console.log(`📤 User ${user.username || userId} left room ${roomSlug}`);
          break;
        }

        case "shape": {
          if (!roomSlug || !payload.shape) return;

          const room = rooms.get(roomSlug);
          if (!room) return;

          // Add shape to room
          const shapeWithId = {
            ...payload.shape,
            id: randomUUID(),
            userId,
            username: user.username || `User-${userId.slice(0, 8)}`,
            timestamp: Date.now()
          };
          
          room.shapes.push(shapeWithId);
          
          // Keep only last 1000 shapes to prevent memory issues
          if (room.shapes.length > 1000) {
            room.shapes = room.shapes.slice(-1000);
          }
          
          // Broadcast to all users in the room
          broadcastToRoom(roomSlug, {
            type: "shape",
            shape: shapeWithId,
            roomSlug
          });
          
          console.log(`📐 Shape added to room ${roomSlug} by ${user.username || userId}`);
          break;
        }

        case "chat": {
          if (!roomSlug || !payload.message) return;
          
          const room = rooms.get(roomSlug);
          if (!room) return;
          
          // Add message to room
          const messageWithId = {
            id: randomUUID(),
            text: payload.message,
            userId,
            username: user.username || `User-${userId.slice(0, 8)}`,
            timestamp: Date.now()
          };
          
          room.messages.push(messageWithId);
          
          // Keep only last 100 messages
          if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100);
          }
          
          // Broadcast to all users in the room
          broadcastToRoom(roomSlug, {
            type: "chat",
            message: messageWithId,
            roomSlug
          });
          
          console.log(`💬 Chat message in room ${roomSlug} by ${user.username || userId}: ${payload.message}`);
          break;
        }

        case "clear_canvas": {
          if (!roomSlug) return;
          
          const room = rooms.get(roomSlug);
          if (room) {
            room.shapes = []; // Clear all shapes
            
            // Notify all users in the room
          broadcastToRoom(roomSlug, {
              type: "canvas_cleared",
            roomSlug,
              clearedBy: user.username || `User-${userId.slice(0, 8)}`
            });
          }
          break;
        }

        case "ping": {
          // Simple ping-pong for connection health
          ws.send(JSON.stringify({ type: "pong" }));
          break;
        }

        default:
          console.log(`⚠️ Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
          ws.send(JSON.stringify({
            type: "error",
        message: "Invalid message format"
          }));
    }
  });

  ws.on("close", () => {
    // Remove user from all rooms
    for (const roomSlug of user.rooms) {
      const room = rooms.get(roomSlug);
      if (room) {
        room.users.delete(userId);
        room.userCount = room.users.size;
        if (room.users.size === 0) {
          rooms.delete(roomSlug);
        } else {
          broadcastToRoom(roomSlug, {
            type: "user_left",
            userId,
            username: user.username || `User-${userId.slice(0, 8)}`,
            roomSlug,
            userCount: room.userCount
          });
        }
      }
    }
    
    users.delete(userId);
    console.log(`❌ User ${user.username || userId} disconnected`);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: "connected",
    userId
  }));
});

function broadcastToRoom(roomSlug: string, message: any, excludeUserId: string | null = null): void {
  const room = rooms.get(roomSlug);
  if (!room) return;
  
  for (const userId of room.users) {
    if (userId === excludeUserId) continue;
    
    const user = users.get(userId);
    if (user && user.ws.readyState === 1) { // 1 = OPEN
      try {
        user.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`❌ Failed to send to user ${userId}:`, error);
      }
    }
  }
}

// Health check endpoint
const http = require("http");
const server = http.createServer((req: any, res: any) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    status: "healthy",
    rooms: rooms.size,
    users: users.size,
    uptime: process.uptime()
  }));
});

server.listen(port + 1, () => {
  console.log(`🏥 Health check server running on port ${port + 1}`);
});
