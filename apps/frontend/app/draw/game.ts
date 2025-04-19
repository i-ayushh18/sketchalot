import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        console.log("🎮 Game constructor called");
        console.log("Room ID:", roomId);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;

        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        console.log("🧹 Destroying Game instance");
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect") {
        console.log("🛠️ Tool changed to:", tool);
        this.selectedTool = tool;
    }

    async init() {
        console.log("📥 Initializing game... fetching existing shapes");
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log("📦 Fetched shapes:", this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            console.log("📨 WebSocket message received:", event.data);
            const message = JSON.parse(event.data);

            if (message.type === "shape") {
                const parsedShape = JSON.parse(message.message);
                console.log("🧩 Parsed shape from WS:", parsedShape.shape);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            console.log("🖼️ Drawing shape:", shape);
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }

    mouseDownHandler = (e: { clientX: number; clientY: number; }) => {
        console.log("🖱️ Mouse down");
        this.clicked = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
    };

    mouseMoveHandler = (e: { clientX: number; clientY: number; }) => {
        if (this.clicked) {
            const rect = this.canvas.getBoundingClientRect();
            const width = e.clientX - rect.left - this.startX;
            const height = e.clientY - rect.top - this.startY;

            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)";
            console.log("✏️ Drawing preview with tool:", this.selectedTool);

            if (this.selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    };

    mouseUpHandler = (e: { clientX: number; clientY: number; }) => {
        console.log("🖱️ Mouse up");
        this.clicked = false;
        const rect = this.canvas.getBoundingClientRect();
        const width = e.clientX - rect.left - this.startX;
        const height = e.clientY - rect.top - this.startY;

        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius
            };
        }

        if (shape) {
            console.log("📤 Sending shape via WebSocket:", shape);
            this.existingShapes.push(shape);
            this.socket.send(JSON.stringify({
                type: "shape",
                message: {
                    shape
                },
                roomId: this.roomId
            }));
        }
    };

    initMouseHandlers() {
        console.log("🧲 Attaching mouse event handlers");
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
