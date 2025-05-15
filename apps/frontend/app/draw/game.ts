// File: app/draw/Game.ts

import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

type BaseLineShape = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil" | "slash" | "arrowright";
    } & BaseLineShape
  | {
      type: "eraser";
      x: number;
      y: number;
      size: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private selectedTool: Tool = "circle";

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    console.log("🛠️ Tool changed to:", tool);
    this.selectedTool = tool;
  }

  private async init() {
    console.log("📥 Initializing game—fetching existing shapes");
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

initHandlers() {
  this.socket.onmessage = (event) => {
    console.log("📨 WebSocket message received:", event.data);
    const message = JSON.parse(event.data);
    
    if (message.type === "shape") {
      console.log("🧩 Parsed shape from WS:", message.shape);
      this.existingShapes.push(message.shape);
      this.clearCanvas();
    }
  };
}


  private clearCanvas() {
    // wipe
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // black bg
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // redraw all shapes
    for (const shape of this.existingShapes) {
      this.ctx.strokeStyle = "white";
      this.ctx.beginPath();

      switch (shape.type) {
        case "rect":
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;

        case "circle":
          this.ctx.arc(
            shape.centerX,
            shape.centerY,
            Math.abs(shape.radius),
            0,
            Math.PI * 2
          );
          break;

        case "pencil":
        case "slash":
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
          break;

        case "arrowright":
          this.drawArrow(
            shape.startX,
            shape.startY,
            shape.endX,
            shape.endY
          );
          break;

        case "eraser":
          // clear a square region
          this.ctx.clearRect(
            shape.x - shape.size / 2,
            shape.y - shape.size / 2,
            shape.size,
            shape.size
          );
          break;
      }

      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private drawArrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    const headlen = 10;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);

    // main line
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);

    // arrowhead left
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI / 6),
      y2 - headlen * Math.sin(angle - Math.PI / 6)
    );

    // arrowhead right
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headlen * Math.cos(angle + Math.PI / 6),
      y2 - headlen * Math.sin(angle + Math.PI / 6)
    );
  }

  private mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    this.currentX = e.clientX - rect.left;
    this.currentY = e.clientY - rect.top;
    const width = this.currentX - this.startX;
    const height = this.currentY - this.startY;

    this.clearCanvas();
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();

    switch (this.selectedTool) {
      case "rect":
        this.ctx.strokeRect(this.startX, this.startY, width, height);
        break;

      case "circle":
        const radius = Math.max(width, height) / 2;
        this.ctx.arc(
          this.startX + radius,
          this.startY + radius,
          Math.abs(radius),
          0,
          Math.PI * 2
        );
        break;

      case "slash":
      case "pencil":
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(this.currentX, this.currentY);
        break;

      case "arrowright":
        this.drawArrow(
          this.startX,
          this.startY,
          this.currentX,
          this.currentY
        );
        break;

      case "eraser":
        const size = 30;
        this.ctx.clearRect(
          this.currentX - size / 2,
          this.currentY - size / 2,
          size,
          size
        );
        break;
    }

    this.ctx.stroke();
    this.ctx.closePath();
  };

  private mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const shape: Shape | null = (() => {
      switch (this.selectedTool) {
        case "rect":
          return {
            type: "rect" as const,
            x: this.startX,
            y: this.startY,
            width: this.currentX - this.startX,
            height: this.currentY - this.startY,
          };

        case "circle":
          const radius = Math.max(
            this.currentX - this.startX,
            this.currentY - this.startY
          ) / 2;
          return {
            type: "circle" as const,
            centerX: this.startX + radius,
            centerY: this.startY + radius,
            radius,
          };

        case "slash":
        case "pencil":
          return {
            type: this.selectedTool,
            startX: this.startX,
            startY: this.startY,
            endX: this.currentX,
            endY: this.currentY,
          };

        case "arrowright":
          return {
            type: "arrowright" as const,
            startX: this.startX,
            startY: this.startY,
            endX: this.currentX,
            endY: this.currentY,
          };

        case "eraser":
          return {
            type: "eraser" as const,
            x: this.currentX,
            y: this.currentY,
            size: 30,
          };

        default:
          return null;
      }
    })();

    if (shape) {
      this.existingShapes.push(shape);
      this.socket.send(JSON.stringify({
        type: "shape",
        shape,
        roomSlug: this.roomId
    }));
      this.clearCanvas();
    }
  };

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
