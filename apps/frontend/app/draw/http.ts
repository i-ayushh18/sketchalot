import { HTTP_BACKEND } from "@/config";
import axios from "axios";

// 1️⃣ Define each shape type…
type RectShape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

type CircleShape = {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
};

type PencilShape = {
  type: "pencil";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type SlashShape = {
  type: "slash";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type ArrowShape = {
  type: "arrowright";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type EraserShape = {
  type: "eraser";
  x: number;
  y: number;
  size: number;
};

// 2️⃣ Union them all
export type Shape =
  | RectShape
  | CircleShape
  | PencilShape
  | SlashShape
  | ArrowShape
  | EraserShape;

interface Message {
  message: string;
}

export async function getExistingShapes(roomSlug: string): Promise<Shape[]> {
  try {
    // Resolve slug → ID
    const roomRes = await axios.get(
      `${HTTP_BACKEND}/room/${encodeURIComponent(roomSlug)}`
    );
    const roomId: number | undefined = roomRes.data.room?.id;
    if (!roomId) return [];

    // Fetch chats by numeric ID
    const res = await axios.get(
      `${HTTP_BACKEND}/chats/${encodeURIComponent(roomId.toString())}`
    );
    const messages: Message[] = res.data.messages;

    // Parse messages into shapes, using the guard below
    const shapes: Shape[] = messages
      .map((x) => {
        try {
          const { shape } = JSON.parse(x.message);
          return isValidShape(shape) ? shape : null;
        } catch (e) {
          console.error("❌ Failed to parse message JSON:", e);
          return null;
        }
      })
      .filter((s): s is Shape => s !== null);

    return shapes;
  } catch (error) {
    console.error("❌ Error fetching existing shapes:", error);
    return [];
  }
}

// 3️⃣ Type‐guard that now accepts arrowright too
function isValidShape(obj: any): obj is Shape {
  if (typeof obj !== "object" || obj === null || typeof obj.type !== "string")
    return false;

  switch (obj.type) {
    case "rect":
      return (
        typeof obj.x === "number" &&
        typeof obj.y === "number" &&
        typeof obj.width === "number" &&
        typeof obj.height === "number"
      );
    case "circle":
      return (
        typeof obj.centerX === "number" &&
        typeof obj.centerY === "number" &&
        typeof obj.radius === "number"
      );
    case "pencil":
    case "slash":
    case "arrowright":  // ← added here
      return (
        typeof obj.startX === "number" &&
        typeof obj.startY === "number" &&
        typeof obj.endX === "number" &&
        typeof obj.endY === "number"
      );
    case "eraser":
      return (
        typeof obj.x === "number" &&
        typeof obj.y === "number" &&
        typeof obj.size === "number"
      );
    default:
      return false;
  }
}

