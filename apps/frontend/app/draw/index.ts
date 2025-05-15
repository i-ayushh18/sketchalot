import { HTTP_BACKEND } from "@/config";
import axios from "axios";

// ─── Shape Type Definitions ───────────────────────────────────────────────────

type RectShape = { type: "rect"; x: number; y: number; width: number; height: number };
type CircleShape = { type: "circle"; centerX: number; centerY: number; radius: number };
type PencilShape = { type: "pencil"; startX: number; startY: number; endX: number; endY: number };
type SlashShape = { type: "slash"; startX: number; startY: number; endX: number; endY: number };
type ArrowShape = { type: "arrowright"; startX: number; startY: number; endX: number; endY: number };
type EraserShape = { type: "eraser"; x: number; y: number; size: number };
type Shape = RectShape | CircleShape | PencilShape | SlashShape | ArrowShape | EraserShape;

// ─── Initialization ──────────────────────────────────────────────────────────

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomSlug: string,
  socket: WebSocket
) {
  console.log("🎨 initDraw CALLED");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  // Resize canvas to fill its container
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  let existingShapes: Shape[] = await getExistingShapes(roomSlug);
  redrawAll(existingShapes, canvas, ctx);

  let tool: Shape["type"] = "rect";
  let down = false;
  let startX = 0, startY = 0;

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "join_room", roomSlug }));
    console.log("🔗 Joined room:", roomSlug);
  };

  socket.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === "shape") {
      existingShapes.push(msg.shape as Shape);
      redrawAll(existingShapes, canvas, ctx);
    }
  };

  for (const t of ["rect", "circle", "pencil", "slash", "arrowright", "eraser"] as Shape["type"][]) {
    const btn = document.getElementById(t + "Button");
    btn?.addEventListener("click", () => {
      tool = t;
      console.log("🛠️ Tool →", tool);
    });
  }

  let prevX = -1, prevY = -1;

  canvas.addEventListener("mousedown", (e) => {
    down = true;
    const r = canvas.getBoundingClientRect();
    startX = e.clientX - r.left;
    startY = e.clientY - r.top;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!down) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (x === prevX && y === prevY) return;
    prevX = x;
    prevY = y;

    redrawAll(existingShapes, canvas, ctx);
    const previewShape = makeShape(tool, startX, startY, x, y);
    ctx.beginPath();
    drawShape(ctx, previewShape, "lime");
    ctx.stroke();
    ctx.closePath();
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!down) return;
    down = false;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
  
    try {
      const shape = makeShape(tool || "rect", startX, startY, x, y);
      if (isValidShape(shape)) {
        existingShapes.push(shape);
        console.log("✅ Sending shape via WebSocket:", shape);
        socket.send(JSON.stringify({ type: "shape", roomSlug: roomSlug.trim(), shape }));
      } else {
        console.warn("⚠️ Skipping invalid shape:", shape);
      }
    } catch (err) {
      console.error("❌ Error creating/sending shape:", err);
    }
  });
  
  function makeShape(tool: Shape["type"], x0: number, y0: number, x1: number, y1: number): Shape {
    switch (tool) {
      case "rect":
        return { type: "rect", x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
      case "circle":
        const dx = x1 - x0, dy = y1 - y0;
        return { type: "circle", centerX: x0, centerY: y0, radius: Math.hypot(dx, dy) };
      case "pencil":
      case "slash":
      case "arrowright":
        return { type: tool, startX: x0, startY: y0, endX: x1, endY: y1 };
      case "eraser":
        return { type: "eraser", x: x1, y: y1, size: 20 };
      default:
        throw new Error("Unknown tool: " + tool);
    }
  }
  
}

// ─── Shape Validator ─────────────────────────────────────────────────────────

function isValidShape(shape: Shape): boolean {
  switch (shape.type) {
    case "rect":
      return isFinite(shape.x) && isFinite(shape.y) && isFinite(shape.width) && isFinite(shape.height);
    case "circle":
      return isFinite(shape.centerX) && isFinite(shape.centerY) && isFinite(shape.radius);
    case "pencil":
    case "slash":
    case "arrowright":
      return isFinite(shape.startX) && isFinite(shape.startY) && isFinite(shape.endX) && isFinite(shape.endY);
    case "eraser":
      return isFinite(shape.x) && isFinite(shape.y) && isFinite(shape.size);
    default:
      return false;
  }
}

// ─── Shape Factory ────────────────────────────────────────────────────────────

function makeShape(tool: Shape["type"], x0: number, y0: number, x1: number, y1: number): Shape {
  switch (tool) {
    case "rect":
      return { type: "rect", x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
    case "circle":
      const dx = x1 - x0, dy = y1 - y0;
      return { type: "circle", centerX: x0, centerY: y0, radius: Math.hypot(dx, dy) };
    case "pencil":
      return { type: "pencil", startX: x0, startY: y0, endX: x1, endY: y1 };
    case "slash":
      return { type: "slash", startX: x0, startY: y0, endX: x1, endY: y1 };
    case "arrowright":
      return { type: "arrowright", startX: x0, startY: y0, endX: x1, endY: y1 };
    case "eraser":
      return { type: "eraser", x: x1, y: y1, size: 20 };
    default:
      throw new Error("Unknown tool: " + tool);
  }
}

// ─── Redraw All Shapes ────────────────────────────────────────────────────────

function redrawAll(shapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of shapes) {
    ctx.beginPath();
    drawShape(ctx, s, "white");
    ctx.stroke();
    ctx.closePath();
  }
}

// ─── Draw Single Shape ────────────────────────────────────────────────────────

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, color: string) {
  ctx.strokeStyle = color;

  switch (shape.type) {
    case "rect":
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;

    case "circle":
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
      break;

    case "pencil":

    case "slash":
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      break;

    case "arrowright":
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      const head = 10;
      const ang = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - head * Math.cos(ang - Math.PI / 6), shape.endY - head * Math.sin(ang - Math.PI / 6));
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - head * Math.cos(ang + Math.PI / 6), shape.endY - head * Math.sin(ang + Math.PI / 6));
      break;

    case "eraser":
      ctx.clearRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
      break;
  }
}

// ─── Fetch Existing Shapes ─────────────────────────────────────────────────────

async function getExistingShapes(slug: string): Promise<Shape[]> {
  try {
    const roomRes = await axios.get(`${HTTP_BACKEND}/room/${encodeURIComponent(slug)}`);
    const room = roomRes.data.room;
    if (!room) return [];

    const res = await axios.get(`${HTTP_BACKEND}/chats/${room.id}`);
    const messages = res.data.messages as { message: string }[];
    return messages.map((m) => JSON.parse(m.message).shape as Shape);
  } catch (err) {
    console.error("❌ Failed to fetch existing shapes:", err);
    return [];
  }
}


// import { HTTP_BACKEND } from "@/config";
// import axios from "axios";

// type Shape =
//   | {
//       type: "rect";
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     }
//   | {
//       type: "circle";
//       centerX: number;
//       centerY: number;
//       radius: number;
//     }
//   | {
//       type: "pencil";
//       startX: number;
//       startY: number;
//       endX: number;
//       endY: number;
//     }
//   // | {
//   //     type: "slash";
//   //     startX: number;
//   //     startY: number;
//   //     endX: number;
//   //     endY: number;
//     // };

// export async function initDraw(
//   canvas: HTMLCanvasElement,
//   roomSlug: string,
//   socket: WebSocket
// ) {
//   console.log("🎨 initDraw CALLED");
//   if (!canvas) {
//     console.error("❌ Canvas element not provided!");
//     return;
//   }

//   const ctx = canvas.getContext("2d");
//   if (!ctx) return;
//   console.log("🧠 Context loaded. Starting init process...");

//   let existingShapes: Shape[] = await getExistingShapes(roomSlug);
//   clearCanvas(existingShapes, canvas, ctx);

//   let clicked = false;
//   let startX = 0;
//   let startY = 0;

//   let tool: "rect" | "circle" | "pencil" | "slash" = "circle"; // default tool

//   socket.onmessage = (event) => {
//     const message = JSON.parse(event.data);
//     console.log("📥 Received WebSocket message:", message);

//     if (message.type === "shape") {
//       const shape = message.shape;
//       if (!shape?.type) {
//         console.error("❌ Received shape with missing type:", shape);
//         return;
//       }
//       existingShapes.push(shape);
//       clearCanvas(existingShapes, canvas, ctx);
//     }
//   };

//   socket.onopen = () => {
//     socket.send(
//       JSON.stringify({
//         type: "join_room",
//         roomSlug,
//       })
//     );
//     console.log("🔗 Joined room:", roomSlug);
//   };

//   const rectButton = document.getElementById("rectButton");
//   if (rectButton) rectButton.addEventListener("click", () => (tool = "rect"));

//   const circleButton = document.getElementById("circleButton");
//   if (circleButton)
//     circleButton.addEventListener("click", () => (tool = "circle"));

//   const pencilButton = document.getElementById("pencilButton");
//   if (pencilButton)
//     pencilButton.addEventListener("click", () => (tool = "pencil"));

//   // const slashButton = document.getElementById("slashButton");
//   // if (slashButton)
//   //   slashButton.addEventListener("click", () => (tool = "slash"));
//   // const arrowButton = document.getElementById("arrowButton");
//   // if (slashButton)
//   //   slashButton.addEventListener("click", () => (tool = "arrow"));


//   canvas.addEventListener("mousedown", (e) => {
//     clicked = true;
//     const rect = canvas.getBoundingClientRect();
//     startX = e.clientX - rect.left;
//     startY = e.clientY - rect.top;
//   });

//   canvas.addEventListener("mouseup", (e) => {
//     if (!clicked) return;
//     clicked = false;
//     const rect = canvas.getBoundingClientRect();
//     const endX = e.clientX - rect.left;
//     const endY = e.clientY - rect.top;

//     let shape: Shape;

//     if (tool === "rect") {
//       shape = {
//         type: "rect",
//         x: startX,
//         y: startY,
//         width: endX - startX,
//         height: endY - startY,
//       };
//     } else if (tool === "circle") {
//       const radius = Math.sqrt(
//         (endX - startX) ** 2 + (endY - startY) ** 2
//       );
//       shape = {
//         type: "circle",
//         centerX: startX,
//         centerY: startY,
//         radius,
//       };
//     } else if (tool === "pencil"){//|| tool === "slash") {
//       shape = {
//         type: "pencil",
//         startX:startX,
//         startY:startY,
//         endX:endX,
//         endY:endY,
//       };
//     // }else if(tool==="arrow"){
//     //   shape={
//     //     type:"arrow",
//     //     startX,
//     //     startY,
//     //     endX,
//     //     endY,
//     //     arrowHead1X,
//     //     arrowHead1Y,
//     //     arrowHead2X,
//     //     arrowHead2X

//     //   }

//     //   }
//     // }
//     } else {
//       console.warn("⚠️ Unknown tool selected:", tool);
//       return;
//     }

//     console.log("✏️ Sending shape:", shape);
//     if (!shape.type) {
//       console.error("❌ Shape missing type. Shape not sent:", shape);
//       return;
//     }
//     existingShapes.push(shape);

//     socket.send(
//       JSON.stringify({
//         type: "shape",
//         roomSlug,
//         shape,
//       })
//     );

//     clearCanvas(existingShapes, canvas, ctx);
//   });

//   canvas.addEventListener("mousemove", (e) => {
//     if (!clicked) return;
//     const rect = canvas.getBoundingClientRect();
//     const currX = e.clientX - rect.left;
//     const currY = e.clientY - rect.top;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = "black";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     existingShapes.forEach((shape) => drawShape(ctx, shape, "white"));

//     let previewShape: Shape;

//     if (tool === "rect") {
//       previewShape = {
//         type: "rect",
//         x: startX,
//         y: startY,
//         width: currX - startX,
//         height: currY - startY,
//       };
//     } else if (tool === "circle") {
//       const radius = Math.sqrt(
//         (currX - startX) ** 2 + (currY - startY) ** 2
//       );
//       previewShape = {
//         type: "circle",
//         centerX: Number(startX),
//         centerY: Number(startY),
//         radius,
//       };
//     } else if (tool === "pencil"){ //|| tool === "slash") {
//       previewShape = {
//         type: tool,
//         startX,
//         startY,
//         endX: currX,
//         endY: currY,
//       }
//     } 
//     else {
//       console.log("Invalid Tool Selected");
//       return;
//     }

//     console.log("👁 Previewing shape:", previewShape);
//     drawShape(ctx, previewShape, "lime");
//   });
// }

// function clearCanvas(
//   shapes: Shape[],
//   canvas: HTMLCanvasElement,
//   ctx: CanvasRenderingContext2D
// ) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "black";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   shapes.forEach((shape) => drawShape(ctx, shape, "white"));
// }

// function drawShape(
//   ctx: CanvasRenderingContext2D,
//   shape: Shape,
//   color: string
// ) {
//   ctx.strokeStyle = color;

//   if (shape.type === "rect") {
//     ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//   } else if (shape.type === "circle") {
//     ctx.beginPath();
//     ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
//     ctx.stroke();
//   } else if (shape.type === "pencil"){//|| shape.type === "slash") {
//     ctx.beginPath();
//     ctx.moveTo(shape.startX, shape.startY);
//     ctx.lineTo(shape.endX, shape.endY);
//     ctx.stroke();
//   }
// }

// async function getExistingShapes(slug: string): Promise<Shape[]> {
//   try {
//     const roomRes = await axios.get(`${HTTP_BACKEND}/room/${slug}`);
//     const room = roomRes.data.room;

//     if (!room) {
//       console.error("❌ No room found for slug:", slug);
//       return [];
//     }

//     // const roomId = room.id;
//     const roomId=room.id;

//     const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
//     const messages = res.data.messages;

//     return messages.map((m: any) => JSON.parse(m.message));
//   } catch (err) {
//     console.error("❌ Failed to fetch existing shapes:", err);
//     return [];
//   }
//}
