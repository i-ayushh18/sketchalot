import { HTTP_BACKEND } from "@/config";
import axios from "axios";

// ─── Shape Type Definitions ──────────────────────────────────────────────────

type RectShape = { type: "rect"; x: number; y: number; width: number; height: number };
type CircleShape = { type: "circle"; centerX: number; centerY: number; radius: number };
type PencilShape = {
  type: "pencil";
  startX: number;
  startY: number;
  size: number;
  endX?: number;
  endY?: number;
  path: { x: number; y: number }[];
};
type SlashShape = { type: "slash"; startX: number; startY: number; endX: number; endY: number };
type ArrowShape = { type: "arrowright"; startX: number; startY: number; endX: number; endY: number };
type EraserShape = {
  type: "eraser";
  startX: number;
  startY: number;
  size: number;
  path: { x: number; y: number }[];
};

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

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  let existingShapes: Shape[] = await getExistingShapes(roomSlug);
  redrawAll(existingShapes, canvas, ctx);

  let tool: Shape["type"] = "rect";
  let down = false;
  let startX = 0,
    startY = 0;
  let currentEraser: EraserShape | null = null;
  let currentPencil: PencilShape | null = null;

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

  canvas.addEventListener("mousedown", (e) => {
    down = true;
    const r = canvas.getBoundingClientRect();
    startX = e.clientX - r.left;
    startY = e.clientY - r.top;

    if (tool === "pencil") {
      currentPencil = {
        type: "pencil",
        startX,
        startY,
        size: 5,
        path: [{ x: startX, y: startY }],
      };
    }

    if (tool === "eraser") {
      currentEraser = {
        type: "eraser",
        startX,
        startY,
        size: 20,
        path: [{ x: startX, y: startY }],
      };
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!down) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    if (tool === "pencil" && currentPencil) {
      currentPencil.path.push({ x, y });
      redrawAll([...existingShapes, currentPencil], canvas, ctx);
    } else if (tool === "eraser" && currentEraser) {
      currentEraser.path.push({ x, y });
      redrawAll([...existingShapes, currentEraser], canvas, ctx);
    } else {
      redrawAll(existingShapes, canvas, ctx);
      const previewShape = makeShape(tool, startX, startY, x, y);
      ctx.beginPath();
      drawShape(ctx, previewShape, "lime");
      ctx.stroke();
      ctx.closePath();
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!down) return;
    down = false;

    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    if (tool === "pencil" && currentPencil) {
      currentPencil.endX = x;
      currentPencil.endY = y;
      existingShapes.push(currentPencil);
      socket.send(JSON.stringify({ type: "shape", roomSlug, shape: currentPencil }));
      currentPencil = null;
      return;
    }

    if (tool === "eraser" && currentEraser) {
      existingShapes.push(currentEraser);
      socket.send(JSON.stringify({ type: "shape", roomSlug, shape: currentEraser }));
      currentEraser = null;
      return;
    }

    try {
      const shape = makeShape(tool, startX, startY, x, y);
      if (isValidShape(shape)) {
        existingShapes.push(shape);
        socket.send(JSON.stringify({ type: "shape", roomSlug, shape }));
      } else {
        console.warn("⚠️ Skipping invalid shape:", shape);
      }
    } catch (err) {
      console.error("❌ Error creating/sending shape:", err);
    }
  });

  window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    redrawAll(existingShapes, canvas, ctx);
  });
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
      return isFinite(shape.startX) && isFinite(shape.startY) && isFinite(shape.endX!) && isFinite(shape.endY!);
    case "eraser":
      return (
        isFinite(shape.startX) &&
        isFinite(shape.startY) &&
        isFinite(shape.size) &&
        Array.isArray(shape.path) &&
        shape.path.length > 0
      );
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
      return { type: "circle", centerX: x0, centerY: y0, radius: Math.hypot(x1 - x0, y1 - y0) };

    case "pencil":
      return {
        type: "pencil",
        startX: x0,
        startY: y0,
        endX: x1,
        endY: y1,
        size: 5,
        path: [{ x: x0, y: y0 }, { x: x1, y: y1 }],
      };

    case "slash":
    case "arrowright":
      return { type: tool, startX: x0, startY: y0, endX: x1, endY: y1 };

    case "eraser":
      return { type: "eraser", startX: x0, startY: y0, size: 20, path: [{ x: x0, y: y0 }, { x: x1, y: y1 }] };

    default:
      throw new Error("Unknown tool: " + tool);
  }
}

// ─── Redraw All Shapes ────────────────────────────────────────────────────────

function redrawAll(shapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of shapes) {
    ctx.beginPath();
    drawShape(ctx, s, "black");
    ctx.stroke();
    ctx.closePath();
  }
}

// ─── Draw Single Shape ────────────────────────────────────────────────────────

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = shape.type === "pencil" || shape.type === "eraser" ? shape.size : 2;
  ctx.lineCap = "round";

  switch (shape.type) {
    case "rect":
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;

    case "circle":
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
      break;

    case "pencil":
    case "eraser":
      for (let i = 1; i < shape.path.length; i++) {
        const from = shape.path[i - 1];
        const to = shape.path[i];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
      break;

    case "slash":
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      break;

    case "arrowright":
      const { startX, startY, endX, endY } = shape;
      const head = 10;
      const angle = Math.atan2(endY - startY, endX - startX);
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - head * Math.cos(angle - Math.PI / 6), endY - head * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - head * Math.cos(angle + Math.PI / 6), endY - head * Math.sin(angle + Math.PI / 6));
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
