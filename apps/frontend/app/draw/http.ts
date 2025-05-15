// import { HTTP_BACKEND } from "@/config";
// import axios from "axios";

// type RectShape = { type: "rect"; x: number; y: number; width: number; height: number; };
// type CircleShape = { type: "circle"; centerX: number; centerY: number; radius: number; };
// type PencilShape = { type: "pencil"; startX: number; startY: number; endX: number; endY: number; };

// type Shape = RectShape | CircleShape | PencilShape;

// interface Message {
//   message: string;
// }

// export async function getExistingShapes(roomId: string): Promise<Shape[]> {
//   try {
//     const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
//     const messages: Message[] = res.data.messages;

//     const shapes: Shape[] = messages
//       .map((x) => {
//         try {
//           const messageData = JSON.parse(x.message);
//           const shape = messageData.shape;

//           // Ensure the shape has the correct properties
//           if (shape && isValidShape(shape)) {
//             return shape;
//           } else {
//             console.error("❌ Invalid shape data:", shape);
//             return undefined;
//           }
//         } catch (e) {
//           console.error("❌ Failed to parse message:", e);
//           return undefined;
//         }
//       })
//       .filter((shape): shape is Shape => shape !== undefined);

//     return shapes;
//   } catch (error) {
//     console.error("❌ Error fetching existing shapes:", error);
//     return []; // Return an empty array if the API call fails
//   }
// }

// // Type guard to validate the shape structure
// function isValidShape(shape: any): shape is Shape {
//   if (typeof shape === "string") {
//     try {
//       shape = JSON.parse(shape); // Parse the string to an object
//     } catch (e) {
//       console.error("❌ Failed to parse shape string:", e);
//       return false; // If parsing fails, it's invalid
//     }
//   }
//   // Ensure shape is an object and has a valid type
//   if (typeof shape !== "object" || shape === null || typeof shape.type !== "string") {
//     return false; // Invalid if it's not an object or type is missing
//   }

//   if (shape.type === "rect") {
//     return typeof shape.x === "number" && typeof shape.y === "number" &&
//            typeof shape.width === "number" && typeof shape.height === "number";
//   } else if (shape.type === "circle") {
//     return typeof shape.centerX === "number" && typeof shape.centerY === "number" &&
//            typeof shape.radius === "number";
//   } else if (shape.type === "pencil") {
//     return typeof shape.startX === "number" && typeof shape.startY === "number" &&
//            typeof shape.endX === "number" && typeof shape.endY === "number";
//   }

//   // Log an unknown shape type if needed
//   console.error("❌ Unknown shape type:", shape.type);
//   return false; // If the type doesn't match, it's invalid
// }
// http.ts

// http.ts

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

