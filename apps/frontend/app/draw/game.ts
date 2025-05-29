import { Tool } from "../components/Canvas";
// import { getExistingShapes } from "./http";

export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "slash" | "arrowright"; startX: number; startY: number; endX: number; endY: number }
  | { type: "pencil"; points: { x: number; y: number }[] }
  | { type: "eraser"; x: number; y: number; size: number };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];

  private roomId: string;
  private socket: WebSocket;
  private user: string;

  private selectedTool: Tool = "circle";
  private clicked = false;

  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private pencilPoints: { x: number; y: number }[] = [];

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, user: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.user = user;

    this.initialize();
  }

  public destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  public setTool(tool: Tool) {
    console.log("🛠️ Tool changed to:", tool);
    this.selectedTool = tool;
  }

  private async initialize() {
    this.registerEventListeners();
    await this.loadShapesFromServer();
    this.sendJoinMessage();
  }

  private async loadShapesFromServer() {
    // this.existingShapes = await getExistingShapes(this.roomId);
    this.renderCanvas();
  }

  private registerEventListeners() {
    this.socket.onmessage = this.handleSocketMessage;
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private sendJoinMessage() {
    this.socket.send(JSON.stringify({ type: "join", roomSlug: this.roomId, user: this.user }));
  }

  private handleSocketMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.type === "shape") {
      this.existingShapes.push(data.shape);
    } else if (data.type === "sync") {
      this.existingShapes = data.shapes;
    }

    this.renderCanvas();
  };

  private renderCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const shape of this.existingShapes) {
      this.ctx.beginPath();

      if (shape.type === "eraser") {
        this.ctx.fillStyle = "black"; // black patch
        this.ctx.fillRect(
          shape.x - shape.size / 2,
          shape.y - shape.size / 2,
          shape.size,
          shape.size
        );
        this.ctx.closePath();
        continue;
      }

      this.ctx.strokeStyle = "white";

      switch (shape.type) {
        case "rect":
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case "circle":
          this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
          break;
        case "slash":
            
        case "arrowright":
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
          if (shape.type === "arrowright") {
            this.drawArrow(shape.startX, shape.startY, shape.endX, shape.endY);
          }
          break;
        case "pencil":
          if (shape.points.length >= 2) {
            this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
              this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
          }
          break;
      }

      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private drawArrow(x1: number, y1: number, x2: number, y2: number) {
    const headlen = 10;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);

    const drawHead = (angleOffset: number) => {
      this.ctx.lineTo(
        x2 - headlen * Math.cos(angle + angleOffset),
        y2 - headlen * Math.sin(angle + angleOffset)
      );
      this.ctx.moveTo(x2, y2);
    };

    drawHead(-Math.PI / 6);
    drawHead(Math.PI / 6);
  }

  private mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const { left, top } = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - left;
    this.startY = e.clientY - top;

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }];
    }
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const { left, top } = this.canvas.getBoundingClientRect();
    this.currentX = e.clientX - left;
    this.currentY = e.clientY - top;

    if (this.selectedTool === "pencil") {
      this.pencilPoints.push({ x: this.currentX, y: this.currentY });
    }

    if (this.selectedTool === "eraser") {
      const size = 30;
      const shape: Shape = {
        type: "eraser",
        x: this.currentX,
        y: this.currentY,
        size,
      };
      this.existingShapes.push(shape);
      this.socket.send(JSON.stringify({ type: "shape", shape, roomSlug: this.roomId }));
      this.renderCanvas();
      return;
    }

    this.previewCurrentShape();
  };

  private mouseUpHandler = () => {
    this.clicked = false;

    if (this.selectedTool === "eraser") return;

    const shape = this.constructShape();
    if (!shape) return;

    this.existingShapes.push(shape);
    this.socket.send(JSON.stringify({ type: "shape", shape, roomSlug: this.roomId }));
    this.renderCanvas();
  };

  private previewCurrentShape() {
// Clear and redraw existing shapes
this.renderCanvas();

// Set preview style
this.ctx.beginPath();
this.ctx.strokeStyle = "lime";

// Calculate shape dimensions
const width = this.currentX - this.startX;
const height = this.currentY - this.startY;

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
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(this.currentX, this.currentY);
    break;
  case "arrowright":
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(this.currentX, this.currentY);
    this.drawArrow(this.startX, this.startY, this.currentX, this.currentY);
    break;
  case "pencil":
    if (this.pencilPoints.length >= 2) {
      this.ctx.moveTo(this.pencilPoints[0].x, this.pencilPoints[0].y);
      for (let i = 1; i < this.pencilPoints.length; i++) {
        this.ctx.lineTo(this.pencilPoints[i].x, this.pencilPoints[i].y);
      }
    }
    break;
}

this.ctx.stroke();
this.ctx.closePath();
}


  private constructShape(): Shape | null {
    const width = this.currentX - this.startX;
    const height = this.currentY - this.startY;

    switch (this.selectedTool) {
      case "rect":
        return { type: "rect", x: this.startX, y: this.startY, width, height };
      case "circle":
        const radius = Math.max(width, height) / 2;
        return {
          type: "circle",
          centerX: this.startX + radius,
          centerY: this.startY + radius,
          radius,
        };
      case "slash":
        return {
          type: "slash",
          startX: this.startX,
          startY: this.startY,
          endX: this.currentX,
          endY: this.currentY,
        };
      case "arrowright":
        return {
          type: "arrowright",
          startX: this.startX,
          startY: this.startY,
          endX: this.currentX,
          endY: this.currentY,
        };
      case "pencil":
        return { type: "pencil", points: this.pencilPoints };
      default:
        return null;
    }
  }
}
