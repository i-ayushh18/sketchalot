import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";
import { randomBytes } from "crypto";  // Importing randomBytes for generating random room IDs
const { JWT_SECRET } = require("@repo/backend-common/config");
const { prismaClient } = require("@repo/db/client");

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];  // List of rooms the user is part of
  userId: string;
}

interface Room {
  slug: string;  // Unique room ID
  users: string[];  // List of userIds in the room
}

let users: User[] = [];
let rooms: Room[] = [];  // Store all rooms and their users

// Function to generate a random room slug (ID)
function generateRoomSlug(): string {
  return randomBytes(8).toString("hex");  // Generates an 8-byte hex string
}

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded?.userId || null;
  } catch (e: any) {
    console.error("JWT verification failed:", e.message);
    return null;
  }
}
interface IncomingMessage {
  type: "create_room" | "join_room" | "leave_room" | "chat" | "shape";  // Add the possible types of messages
  roomSlug?: string;  // For join, leave, chat, and shape messages
  message?: string;   // For chat messages
  shape?: ShapeData;  // For shape messages
}

// Define the structure of shape data for the "shape" message type
interface ShapeData {
  type: "rect" | "circle" | "slash" | "pencil" | "arrowright" | "eraser";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  points?: { x: number; y: number }[]; // For pencil tool
  size?: number; // For eraser thickness
}


wss.on("connection", async (ws: WebSocket, request: any) => {
  const url = request?.url || "";
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    console.log("❌ Invalid token");
    ws.close(1008, "Invalid Token");
    return;
  }

  users = users.filter((u) => u.userId !== userId || u.ws !== ws); // dedupe
  const user: User = { ws, rooms: [], userId };
  users.push(user);
  console.log(`✅ User ${userId} connected`);

  ws.on("message", async (data: string | Buffer | ArrayBuffer | Buffer[]) => {
    try {
      let jsonString: string;

      if (typeof data === "string") {
        jsonString = data;
      } else if (Buffer.isBuffer(data)) {
        jsonString = data.toString("utf-8");
      } else if (data instanceof ArrayBuffer) {
        jsonString = Buffer.from(data).toString("utf-8");
      } else if (Array.isArray(data)) {
        jsonString = Buffer.concat(data).toString("utf-8");
      } else {
        console.error("❌ Unsupported data type received:", typeof data);
        return;
      }

      console.log("📦 Received JSON string:", jsonString);

      const parsedData = JSON.parse(jsonString) as IncomingMessage;
      console.log("✅ Parsed JSON:", parsedData);

      // Ensure roomSlug is always a valid string
      if (parsedData.roomSlug && typeof parsedData.roomSlug !== "string") {
        console.error("❌ Invalid roomSlug type");
        return;
      }

      const { type, roomSlug, message, shape } = parsedData;

      switch (type) {
        case "join_room": {
          if (!roomSlug) {
            console.error("❌ Missing roomSlug for join_room");
            return;
          }

          if (!user.rooms.includes(roomSlug)) {
            user.rooms.push(roomSlug);
            console.log(`📥 ${userId} joined ${roomSlug}`);
          }
          break;
        }

        case "leave_room": {
          if (!roomSlug) {
            console.error("❌ Missing roomSlug for leave_room");
            return;
          }

          user.rooms = user.rooms.filter((slug) => slug !== roomSlug);
          console.log(`📤 ${userId} left ${roomSlug}`);
          break;
        }

        case "chat": {
          const roomSlug = parsedData.roomSlug;
          if (!roomSlug || typeof roomSlug !== "string") {
            console.error("❌ Invalid or missing roomSlug");
            return;
          }
          if (typeof message !== "string" || !message.trim()) {
            console.log("❌ Invalid chat message");
            return;
          }
          const room = await prismaClient.room.findUnique({
            where: { slug: roomSlug },
          });

          if (!room) {
            console.log(`❌ Room not found: ${roomSlug}`);
            return;
          }

          const chat = await prismaClient.chat.create({
            data: {
              message,
              roomId: room.id,
              userId,
            },
          });

          broadcastToRoom(roomSlug, {
            type: "chat",
            message: chat.message,
            roomSlug,
            sender: userId,
          });
          break;
        }

        case "shape": {
          const roomSlug = parsedData.roomSlug;
          if (!roomSlug || typeof roomSlug !== "string") {
            console.error("❌ Invalid or missing roomSlug");
            return;
          }
        
          if (!shape?.type) {
            console.log("❌ Invalid shape: missing type");
            return;
          }
        
          // 🔁 Normalize incoming shape types
          const aliasMap: Record<string, ShapeData["type"]> = {
            rect: "rect",
            slash: "slash",
            arrowright:"arrowright",  
            pencil: "pencil",
            circle: "circle",
            eraser:"eraser"
          };
        
          const rawType = shape.type;
          const normalizedType = aliasMap[rawType];
        
          if (!normalizedType) {
            console.error("❌ Unknown shape type:", rawType);
            ws.send(
              JSON.stringify({
                type: "error",
                message: `Unknown shape type: ${rawType}`,
              })
            );
            return;
          }
        
          const room = await prismaClient.room.findUnique({
            where: { slug: roomSlug },
          });
        
          if (!room) {
            console.error("❌ Room not found");
            return;
          }
        
          try {
            console.log("📐 Incoming shape data:", shape);
        
            const {
              x, y, width, height, radius, centerX, centerY,
              startX, startY, endX, endY, points, size
            } = shape;
            
            const shapeData: any = {
              type: normalizedType,
              room: { connect: { id: room.id } },
            };
            
            if (typeof x === "number") shapeData.x = x;
            if (typeof y === "number") shapeData.y = y;
            if (typeof width === "number") shapeData.width = width;
            if (typeof height === "number") shapeData.height = height;
            if (typeof radius === "number") shapeData.radius = radius;
            if (typeof centerX === "number") shapeData.centerX = centerX;
            if (typeof centerY === "number") shapeData.centerY = centerY;
            if (typeof startX === "number") shapeData.startX = startX;
            if (typeof startY === "number") shapeData.startY = startY;
            if (typeof endX === "number") shapeData.endX = endX;
            if (typeof endY === "number") shapeData.endY = endY;
            if (Array.isArray(points)) shapeData.points = points;
            if (typeof size === "number") shapeData.size = size;
            
            await prismaClient.shape.create({
              data: shapeData,
            });
        
            console.log("✅ Shape created successfully");
        
            broadcastToRoom(roomSlug, {
              type: "shape",
              shape: { ...shape, type: normalizedType }, // Send normalized type to clients too
              roomSlug,
              sender: userId,
            });
          } catch (e) {
            console.error("❌ Failed to create shape:", e);
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Failed to create shape",
              })
            );
          }
          break;
        }
        

        default:
          console.log("⚠️ Unknown message type:", (parsedData as any).type);
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Unknown message type: ${(parsedData as any).type}`,
            })
          );
      }
    } catch (e) {
      console.error("❌ JSON parse error:", e);
    }
  });

  ws.on("close", () => {
    users = users.filter((u) => u.ws !== ws);
    console.log(`❌ ${userId} disconnected`);
  });
});


function broadcastToRoom(roomSlug: string, message: any, excludeUserId?: string) {
  users.forEach((user) => {
    if (user.rooms.includes(roomSlug) && user.userId !== excludeUserId) {
      try {
        user.ws.send(JSON.stringify(message));
      } catch (err) {
        console.error(`Failed to send to user ${user.userId}:`, err);
      }
    }
  });
}
