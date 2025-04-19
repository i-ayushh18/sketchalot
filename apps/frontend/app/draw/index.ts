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
//     };

// export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
//   const ctx = canvas.getContext("2d");
//   const existingShapes: Shape[] = await getExistingShapes(roomId);
//   console.log("Existing shapes from backend:", existingShapes);
//   if (!ctx) return;

//   // Initial canvas background
//   ctx.fillStyle = "rgba(0,0,0)";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   clearCanvas(existingShapes, canvas, ctx);
 
  
//   // Handle incoming messages
//   let socketConnected=false;
//   socket.onopen = () => {
//     console.log("WebSocket connected");
  
//     socket.send(
//       JSON.stringify({
//         type: "join_room",
//         roomSlug: roomId,
//       })
//     );
//     socketConnected=true;
//   };
  

//   socket.onmessage = (event: { data: string }) => {
//     const message = JSON.parse(event.data);
//     if (message.type === "chat") {
//       const parsedShape = JSON.parse(message.message);
//       console.log("Received shape:", parsedShape);
//       existingShapes.push(parsedShape.shape);
//       clearCanvas(existingShapes, canvas, ctx);
//     }
//   };

//   // Drawing logic
//   clearCanvas(existingShapes,canvas,ctx)
//   let clicked = false;
//   let startX = 0;
//   let startY = 0;

//   canvas.addEventListener("mousedown", (e) => {
//     clicked = true;
//     const rect = canvas.getBoundingClientRect();
//     startX = e.clientX - rect.left;
//     startY = e.clientY - rect.top;
    
//   });

//   canvas.addEventListener("mouseup", (e) => {
//     clicked = false;
//     const rect = canvas.getBoundingClientRect();
//     const endX = e.clientX - rect.left;
//     const endY = e.clientY - rect.top;

//     const width = endX - startX;
//     const height = endY - startY;

//     const shape: Shape = {
//       type: "rect",
//       x: startX,
//       y: startY,
//       width,
//       height,
//     };

//     existingShapes.push(shape);
//     if(socketConnected){
//     socket.send(
//       JSON.stringify({
//         type: "chat",
//         roomSlug:roomId,
//         message:JSON.stringify({shape})
        
//       }),
//     );
//   }else{
//     console.log("tried to send shape before ws was ready")
//   }

//     clearCanvas(existingShapes, canvas, ctx);
//   });

//   canvas.addEventListener("mousemove", (e) => {
//     if (clicked) {
//       const rect = canvas.getBoundingClientRect();
//       const currX = e.clientX - rect.left;
//       const currY = e.clientY - rect.top;

//       const width = currX - startX;
//       const height = currY - startY;

//       // Clear everything and redraw previous shapes
// ctx.clearRect(0, 0, canvas.width, canvas.height);
// ctx.fillStyle = "rgba(0,0,0)";
// ctx.fillRect(0, 0, canvas.width, canvas.height);

// // Redraw old shapes
// existingShapes.forEach((shape) => {
//   if (shape.type === "rect") {
//     ctx.strokeStyle = "rgba(255,255,255)";
//     ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//   }
// });

// // Draw current preview shape
// ctx.strokeStyle = "rgba(0,255,0)";
// ctx.strokeRect(startX, startY, width, height);

//     }
//   });
// }


// function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "rgba(0,0,0)";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   existingShapes.forEach((shape) => {
//     if (shape.type === "rect") {
//       ctx.strokeStyle = "rgba(255,255,255)";
//       ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//     }
//   });
// }

// async function getExistingShapes(slug: string): Promise<Shape[]> {
//   // Step 1: Get roomId from slug
//   const roomRes = await axios.get(`${HTTP_BACKEND}/room/${slug}`);
//   const roomId = roomRes.data.room.id;

//   // Step 2: Now use roomId to get shapes (chat messages)
//   const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
//   console.log("Backend response:", res.data);

//   const messages = res.data.messages;

//   // Step 3: Convert messages to Shape[] (if needed)
//   const shapes: Shape[] = messages.map((m: any) => JSON.parse(m.message));
//   return shapes;
// }

// // import { HTTP_BACKEND } from "@/config";
// // import axios from "axios";

// // type Shape =
// //   | {
// //       type: "rect";
// //       x: number;
// //       y: number;
// //       width: number;
// //       height: number;
// //     }
// //   | {
// //       type: "circle";
// //       centerX: number;
// //       centerY: number;
// //       radius: number;
// //     };

// // export async function initDraw(canvas: HTMLCanvasElement, slug: string, socket: WebSocket) {//roomId
// //   const ctx = canvas.getContext("2d");
// //   if (!ctx) return;

// //   const existingShapes: Shape[] = await getExistingShapes(slug);//roomId
// //   console.log("Existing shapes from backend:", existingShapes);

// //   // Draw initial state
// //   clearCanvas(existingShapes, canvas, ctx);

// //   let socketConnected = false;
// //   let shapeQueue: string[] = [];
  

// //   // On WebSocket open
// //   socket.onopen = () => {
// //     console.log("WebSocket connected");
// //     console.log(socket.readyState); 

// //     if (socket.readyState === WebSocket.OPEN) {
// //       socket.send(
// //         JSON.stringify({
// //           type: "join_room",
// //           roomSlug: slug, // roomId
// //         })
// //       );
// //     } else {
// //       console.error("WebSocket is not open yet.");
// //     }
    

// //     socketConnected = true
// //     console.log("connect ho gaya")

// //     // Send any queued shapes
// //     shapeQueue.forEach((msg) => {
// //       console.log("Sending queued shape:", msg);
// //       socket.send(msg);
// //     });

// //     shapeQueue = [];
// //   };

// //   // On receiving message
// //   socket.onmessage = (event) => {
// //     const message = JSON.parse(event.data);
// //     if (message.type === "chat") {
// //       const parsedShape = JSON.parse(message.message);
// //       console.log("Received shape:", parsedShape);
// //       existingShapes.push(parsedShape.shape);
// //       clearCanvas(existingShapes, canvas, ctx);
// //     }
// //   };

// //   socket.onerror = (error) => {
// //     console.error("WebSocket error:", error);
// //   };

// //   socket.onclose = () => {
// //     console.warn("WebSocket closed");
// //     socketConnected = false;
// //   };

// //   // Drawing logic
// //   let clicked = false;
// //   let startX = 0;
// //   let startY = 0;

// //   canvas.addEventListener("mousedown", (e) => {
// //     clicked = true;
// //     const rect = canvas.getBoundingClientRect();
// //     startX = e.clientX - rect.left;
// //     startY = e.clientY - rect.top;
// //   });

// //   canvas.addEventListener("mouseup", (e) => {
// //     clicked = false;
// //     const rect = canvas.getBoundingClientRect();
// //     const endX = e.clientX - rect.left;
// //     const endY = e.clientY - rect.top;

// //     const width = endX - startX;
// //     const height = endY - startY;

// //     const shape: Shape = {
// //       type: "rect",
// //       x: startX,
// //       y: startY,
// //       width,
// //       height,
// //     };

// //     existingShapes.push(shape);

// //     const message = JSON.stringify({
// //       type: "chat",
// //       roomSlug: slug,//roomId,
// //       message: JSON.stringify({ shape }),
// //     });

// //     if (socketConnected) {
// //       console.log("Sending shape:", message);
// //       socket.send(message);
// //     } else {
// //       console.warn("WebSocket not ready, queuing shape");
// //       shapeQueue.push(message);
// //     }

// //     clearCanvas(existingShapes, canvas, ctx);
// //   });

// //   canvas.addEventListener("mousemove", (e) => {
// //     if (!clicked) return;

// //     const rect = canvas.getBoundingClientRect();
// //     const currX = e.clientX - rect.left;
// //     const currY = e.clientY - rect.top;

// //     const width = currX - startX;
// //     const height = currY - startY;

// //     ctx.clearRect(0, 0, canvas.width, canvas.height);
// //     ctx.fillStyle = "rgba(0,0,0)";
// //     ctx.fillRect(0, 0, canvas.width, canvas.height);

// //     // Draw all existing shapes
// //     existingShapes.forEach((shape) => {
// //       drawShape(ctx, shape, "white");
// //     });

// //     // Draw preview shape`
// //     drawShape(ctx, {
// //       type: "rect",
// //       x: startX,
// //       y: startY,
// //       width,
// //       height,
// //     }, "lime");
// //   });
// // }

// // // 🔄 Clear + redraw canvas
// // function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
// //   ctx.clearRect(0, 0, canvas.width, canvas.height);
// //   ctx.fillStyle = "rgba(0,0,0)";
// //   ctx.fillRect(0, 0, canvas.width, canvas.height);

// //   existingShapes.forEach((shape) => {
// //     drawShape(ctx, shape, "white");
// //   });
// // }

// // // ✏️ Shape drawing utility
// // function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, color: string) {
// //   ctx.strokeStyle = color;
// //   if (shape.type === "rect") {
// //     ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
// //   } else if (shape.type === "circle") {
// //     ctx.beginPath();
// //     ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
// //     ctx.stroke();
// //   }
// // }

// // // 📦 Fetch existing shapes from backend
// // async function getExistingShapes(slug: string): Promise<Shape[]> {
// //   const roomRes = await axios.get(`${HTTP_BACKEND}/room/${slug}`);
// //   const roomId = roomRes.data.room.id;

// //   const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
// //   console.log("Backend response:", res.data);

// //   const messages = res.data.messages;

// //   const shapes: Shape[] = messages.map((m: any) => JSON.parse(m.message));
// //   return shapes;
// // }
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
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
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };
    

export async function initDraw(canvas: HTMLCanvasElement, roomSlug: string, socket: WebSocket) {
  console.log("🎨 initDraw CALLED");
  if (!canvas) {
    console.error("❌ Canvas element not provided!");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  console.log("🧠 Context loaded. Starting init process...");

  let existingShapes: Shape[] = await getExistingShapes(roomSlug);
  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  let tool: 'rect' | 'circle' | 'pencil' = 'rect';

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("📥 Received WebSocket message:", message);
    
    if (message.type === "shape") {
      const shape = message.shape;
      if (!shape?.type) {
        console.error("❌ Received shape with missing type:", shape);
        return;
      }
      existingShapes.push(shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: "join_room",
        roomSlug,
      })
    );
    console.log("🔗 Joined room:", roomSlug);
  };

  const rectButton = document.getElementById('rectButton');
  if (rectButton) rectButton.addEventListener('click', () => (tool = 'rect'));

  const circleButton = document.getElementById('circleButton');
  if (circleButton) circleButton.addEventListener('click', () => (tool = 'circle'));

  const pencilButton = document.getElementById('pencilButton');
  if (pencilButton) pencilButton.addEventListener('click', () => (tool = 'pencil'));

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!clicked) return;
    clicked = false;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    let shape: Shape;

    if (tool === 'rect') {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
      };
    } else if (tool === 'circle') {
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      shape = {
        type: "circle",
        centerX: startX,
        centerY: startY,
        radius,
      };
    } else if (tool === 'pencil') {
      shape = {
        type: "pencil",
        startX,
        startY,
        endX,
        endY,
      };
    } else {
      console.warn("⚠️ Unknown tool selected:", tool);
      return;
    }

    console.log("✏️ Sending shape:", shape);

    if (!shape.type) {
      console.error("❌ Shape missing type. Shape not sent:", shape);
      return;
    }

    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "shape",
        roomSlug,
        shape,
      })
    );

    clearCanvas(existingShapes, canvas, ctx);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;
    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.forEach((shape) => drawShape(ctx, shape, "white"));

    let previewShape: Shape;

    if (tool === 'rect') {
      previewShape = {
        type: "rect",
        x: startX,
        y: startY,
        width: currX - startX,
        height: currY - startY,
      };
    } else if (tool === 'circle') {
      const radius = Math.sqrt((currX - startX) ** 2 + (currY - startY) ** 2);
      previewShape = {
        type: "circle",
        centerX: startX,
        centerY: startY,
        radius,
      };
    } else if (tool === 'pencil') {
      previewShape = {
        type: "pencil",
        startX,
        startY,
        endX: currX,
        endY: currY,
      };
    } else {
      console.warn("⚠️ Unknown tool during preview:", tool);
      return;
    }

    console.log("👁 Previewing shape:", previewShape);
    drawShape(ctx, previewShape, "lime");
  });
}

function clearCanvas(shapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  shapes.forEach((shape) => drawShape(ctx, shape, "white"));
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, color: string) {
  ctx.strokeStyle = color;
  if (shape.type === "rect") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (shape.type === "pencil") {
    ctx.beginPath();
    ctx.moveTo(shape.startX, shape.startY);
    ctx.lineTo(shape.endX, shape.endY);
    ctx.stroke();
  }
}

async function getExistingShapes(slug: string): Promise<Shape[]> {
  try {
    const roomRes = await axios.get(`${HTTP_BACKEND}/room/${slug}`);
    const room = roomRes.data.room;

    if (!room) {
      console.error("❌ No room found for slug:", slug);
      return [];
    }

    const roomId = room.id;

    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    return messages.map((m: any) => JSON.parse(m.message));
  } catch (err) {
    console.error("❌ Failed to fetch existing shapes:", err);
    return [];
  }
}
