// // // import jwt, { JwtPayload } from "jsonwebtoken";
// // // import { WebSocket, WebSocketServer } from "ws";
// const { JWT_SECRET } = require("@repo/backend-common/config");
// const { prismaClient } = require("@repo/db/client");

// // // const wss = new WebSocketServer({ port: 8080 });

// // // interface User {
// // //   ws: WebSocket;
// // //   rooms: string[]; // List of room slugs
// // //   userId: string;
// // // }

// // // let users: User[] = [];

// // // function checkUser(token: string): string | null {
// // //   try {
// // //     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
// // //     if (!decoded || !decoded.userId) return null;
// // //     return decoded.userId;
// // //   } catch (e: any) {
// // //     console.error("JWT verification failed:", e.message);
// // //     return null;
// // //   }
// // // }

// // // wss.on("connection", function connection(ws: WebSocket, request: any) {
// // //   const queryParams = new URLSearchParams(request.url?.split("?")[1] || "");
// // //   const token = queryParams.get("token") || "";
// // //   const userId = checkUser(token);

// // //   if (!userId) {
// // //     console.log("Invalid token, closing WebSocket connection.");
// // //     ws.close(1008, "Invalid Token");
// // //     return;
// // //   }

// // //   // Clean up any previous connections for the user
// // //   users = users.filter((user) => user.userId !== userId);
// // //   const user: User = { userId, ws, rooms: [] };
// // //   users.push(user);

// // //   console.log(`✅ User ${userId} connected via WebSocket`);

// // //   ws.on("message", async (data) => {
// // //     let parsedData;
// // //     if(typeof data!="string"){
// // //       parsedData=JSON.parse(data.toString());
// // //       }
// // //      else{
// // //       parsedData=JSON.parse(data);
// // //      }
// // //     // const parsedData = JSON.parse(data.toString());
// // //     const currentUser = users.find((u) => u.ws === ws);

// // //     console.log(parsedData)
// // //     if (!currentUser) return;

// // //     switch (parsedData.type) {
// // //       case "join_room": {
// // //         const { roomSlug } = parsedData;
// // //         if (!currentUser.rooms.includes(roomSlug)) {
// // //           currentUser.rooms.push(roomSlug);
// // //           console.log(`📥 User ${userId} joined room ${roomSlug}`);

// // //           // Notify others in the room
// // //           broadcastToRoom(roomSlug, {
// // //             type: "user_joined",
// // //             roomSlug,
// // //             userId,
// // //           }, userId);
// // //         }
// // //         break;
// // //       }

// // //       case "leave_room": {
// // //         const { roomSlug } = parsedData;
// // //         currentUser.rooms = currentUser.rooms.filter((slug) => slug !== roomSlug);
// // //         console.log(`📤 User ${userId} left room ${roomSlug}`);

// // //         // Notify others in the room
// // //         broadcastToRoom(roomSlug, {
// // //           type: "user_left",
// // //           roomSlug,
// // //           userId,
// // //         }, userId);
// // //         break;
// // //       }

// // //       case "chat": {
// // //         const { roomSlug, message } = parsedData;

// // //         if (typeof message !== "string" || message.trim().length === 0) {
// // //           console.log("❌ Invalid message");
// // //           return;
// // //         }

// // //         const room = await prismaClient.room.findUnique({
// // //           where: { slug: roomSlug },
// // //         });

// // //         if (!room) {
// // //           console.log(`❌ Room with slug ${roomSlug} not found`);
// // //           return;
// // //         }

// // //         const chat = await prismaClient.chat.create({
// // //           data: {
// // //            roomId:Number(roomSlug),
// // //             message,
// // //             userId,
// // //           },
// // //         });

// // //         // Broadcast the message to others in the room
// // //         broadcastToRoom(roomSlug, {
// // //           type: "new_message",
// // //           message: chat.message,
// // //           roomSlug,
// // //           sender: userId,
// // //         });
// // //         break;
// // //       }

// // //       default:
// // //         console.log("⚠️ Unknown message type received:", parsedData.type);
// // //     }
// // //   });

// // //   ws.on("close", () => {
// // //     users = users.filter((u) => u.ws !== ws);
// // //     console.log(`❌ User ${userId} disconnected`);
// // //   });
// // // });

// // // // Helper function to broadcast to all users in a room
// // // function broadcastToRoom(roomSlug: string, message: any, excludeUserId?: string) {
// // //   users.forEach((user) => {
// // //     if (user.rooms.includes(roomSlug) && user.userId !== excludeUserId) {
// // //       user.ws.send(JSON.stringify(message));
// // //     }
// // //   });
// // // }
// // // // import { WebSocket, WebSocketServer } from "ws";
// // // // import jwt, { JwtPayload } from "jsonwebtoken";
// // // // const { JWT_SECRET } = require("@repo/backend-common");
// // // // const { prismaClient } = require("@repo/db/client");

// // // // const wss = new WebSocketServer({ port: 8080 });

// // // // interface User {
// // // //   ws: WebSocket;
// // // //   rooms: string[]; // List of room slugs
// // // //   userId: string;
// // // // }

// // // // const users: User[] = [];

// // // // function checkUser(token: string): string | null {
// // // //   try {
// // // //     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
// // // //     if (!decoded || !decoded.userId) return null;
// // // //     return decoded.userId;
// // // //   } catch (e) {
// // // //     return null;
// // // //   }
// // // // }

// // // // wss.on("connection", function connection(ws: WebSocket, request: any) {
// // // //   const url = request.url;
// // // //   if (!url) {
// // // //     return;
// // // //   }

// // // //   const queryParams = new URLSearchParams(url.split("?")[1]);
// // // //   const token = queryParams.get("token") || "";
// // // //   const userId = checkUser(token);

// // // //   if (userId == null) {
// // // //     ws.close();
// // // //     return null;
// // // //   }

// // // //   users.push({
// // // //     userId,
// // // //     rooms: [],
// // // //     ws,
// // // //   });

// // // //   ws.on("message", async function message(data) {
// // // //     let parsedData;
// // // //     if (typeof data !== "string") {
// // // //       parsedData = JSON.parse(data.toString());
// // // //     } else {
// // // //       parsedData = JSON.parse(data); // {type: "join-room", roomSlug: "room1"}
// // // //     }

// // // //     if (parsedData.type === "join_room") {
// // // //       const user = users.find((x) => x.ws === ws);
// // // //       if (user && !user.rooms.includes(parsedData.roomSlug)) {
// // // //         user.rooms.push(parsedData.roomSlug);
// // // //         console.log(`User ${userId} joined room ${parsedData.roomSlug}`);
// // // //       }
// // // //     }

// // // //     if (parsedData.type === "leave_room") {
// // // //       const user = users.find((x) => x.ws === ws);
// // // //       if (!user) {
// // // //         return;
// // // //       }
// // // //       user.rooms = user.rooms.filter((x) => x !== parsedData.roomSlug);
// // // //       console.log(`User ${userId} left room ${parsedData.roomSlug}`);
// // // //     }

// // // //     //added shapes to send
// // // //     if (parsedData.type === "shape") {
// // // //       const { roomSlug, shape } = parsedData;

// // // //       // Ensure the shape is valid
// // // //       if (!shape || !shape.type) {
// // // //         console.log("❌ Invalid shape data");
// // // //         return;
// // // //       }

// // // //       try {
// // // //         // Fetch the roomId from roomSlug
// // // //         const room = await prismaClient.room.findUnique({
// // // //           where: { slug: roomSlug },
// // // //         });

// // // //         if (!room) {
// // // //           console.log(`❌ Room with slug ${roomSlug} not found`);
// // // //           return;
// // // //         }
// // // //         await prismaClient.shape.create({
// // // //           data: {
// // // //             shapeType: shape.type,
// // // //             x: shape.x,
// // // //             y: shape.y,
// // // //             width: shape.width,
// // // //             height: shape.height,
// // // //             room: {
// // // //               connect: { slug: roomSlug },
// // // //             },
// // // //             user: {
// // // //               connect: { id: userId }, // this must be correct
// // // //             },
// // // //           },
// // // //         });

// // // //         // Broadcast the shape to users in the room
// // // //         users.forEach((user) => {
// // // //           if (user.rooms.includes(roomSlug)) {
// // // //             console.log(`Sending shape to user ${user.userId}`);
// // // //             user.ws.send(JSON.stringify({
// // // //               type: "shape",
// // // //               shape,
// // // //               roomSlug,
// // // //               sender: userId,
// // // //             }));
// // // //           }
// // // //         });

// // // //       } catch (error) {
// // // //         console.error("Error broadcasting shape:", error);
// // // //       }
// // // //     }

// // // //     // Handle chat messages
// // // //     if (parsedData.type === "chat") {
// // // //       const { roomSlug, message } = parsedData;

// // // //       // Ensure the message is valid
// // // //       if (typeof message !== "string" || message.trim().length === 0) {
// // // //         console.log("❌ Invalid message");
// // // //         return;
// // // //       }

// // // //       try {
// // // //         // Fetch the roomId from roomSlug
// // // //         const room = await prismaClient.room.findUnique({
// // // //           where: { slug: roomSlug },
// // // //         });

// // // //         if (!room) {
// // // //           console.log(`❌ Room with slug ${roomSlug} not found`);
// // // //           return;
// // // //         }

// // // //         // Create the chat message
// // // //         const chat = await prismaClient.chat.create({
// // // //           data: {
// // // //             message,
// // // //             room: {
// // // //               connect: {
// // // //                 id: room.id, // or 4
// // // //               },
// // // //             },
// // // //             user: {
// // // //               connect: {
// // // //                 id:userId,
// // // //               },
// // // //             },
// // // //           },
// // // //         });

// // // //         console.log("Message saved to database");

// // // //         // Broadcast the message to users in the room
// // // //         users.forEach((user) => {
// // // //           if (user.rooms.includes(roomSlug)) {
// // // //             user.ws.send(
// // // //               JSON.stringify({
// // // //                 type: "chat",
// // // //                 message: chat.message,
// // // //                 roomSlug,
// // // //                 sender: userId,
// // // //               })
// // // //             );
// // // //           }
// // // //         });
// // // //       } catch (error) {
// // // //         console.error("Error saving message to database:", error);
// // // //       }
// // // //     }
// // // //   });

// // // //   ws.on("close", () => {
// // // //     // Clean up user when they disconnect
// // // //     const userIndex = users.findIndex((u) => u.ws === ws);
// // // //     if (userIndex !== -1) {
// // // //       users.splice(userIndex, 1);
// // // //       console.log(`User ${userId} disconnected`);
// // // //     }
// // // //   });
// // // // });

// // // // // Helper function to broadcast messages to users in a specific room
// // // // function broadcastToRoom(roomSlug: string, message: any, excludeUserId?: string) {
// // // //   users.forEach((user) => {
// // // //     if (user.rooms.includes(roomSlug)) {
// // // //       user.ws.send(JSON.stringify(message.shape));
// // // //     }
// // // //   });
// // // // }
// // import { WebSocket, WebSocketServer } from 'ws';
// // import jwt, { JwtPayload } from "jsonwebtoken";
// // // import { JWT_SECRET } from '@repo/backend-common/config';
// // // import { prismaClient } from "@repo/db/client";

// // const wss = new WebSocketServer({ port: 8080 });

// // interface User {
// //   ws: WebSocket,
// //   rooms: string[],
// //   userId: string
// // }

// // const users: User[] = [];

// // function checkUser(token: string): string | null {
// //   try {
// //     const decoded = jwt.verify(token, JWT_SECRET);

// //     if (typeof decoded == "string") {
// //       return null;
// //     }

// //     if (!decoded || !decoded.userId) {
// //       return null;
// //     }

// //     return decoded.userId;
// //   } catch(e) {
// //     return null;
// //   }
// //   return null;
// // }

// // wss.on('connection', function connection(ws, request) {
// //   const url = request.url;
// //   if (!url) {
// //     return;
// //   }
// //   const queryParams = new URLSearchParams(url.split('?')[1]);
// //   const token = queryParams.get('token') || "";
// //   const userId = checkUser(token);

// //   if (userId == null) {
// //     ws.close()
// //     return null;
// //   }

// //   users.push({
// //     userId,
// //     rooms: [],
// //     ws
// //   })

// //   ws.on('message', async function message(data) {
// //     let parsedData;
// //     if (typeof data !== "string") {
// //       parsedData = JSON.parse(data.toString());
// //     } else {
// //       parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
// //     }

// //     if (parsedData.type === "join_room") {
// //       const user = users.find(x => x.ws === ws);
// //       user?.rooms.push(parsedData.roomId);
// //     }

// //     if (parsedData.type === "leave_room") {
// //       const user = users.find(x => x.ws === ws);
// //       if (!user) {
// //         return;
// //       }
// //       user.rooms = user?.rooms.filter(x => x === parsedData.room);
// //     }

// //     console.log("message received")
// //     console.log(parsedData);

// //     if (parsedData.type === "chat") {
// //       const roomId = parsedData.roomId;
// //       const message = parsedData.message;

// //       await prismaClient.chat.create({
// //         data: {
// //           roomId: Number(roomId),
// //           message,
// //           userId
// //         }
// //       });

// //       users.forEach(user => {
// //         if (user.rooms.includes(roomId)) {
// //           user.ws.send(JSON.stringify({
// //             type: "chat",
// //             message: message,
// //             roomId
// //           }))
// //         }
// //       })
// //     }

// //   });

// // });
// import { WebSocket, WebSocketServer } from 'ws';
// import jwt, { JwtPayload } from "jsonwebtoken";
// // import { JWT_SECRET } from '@repo/backend-common/config';
// // import { prismaClient } from "@repo/db/client";

// const wss = new WebSocketServer({ port: 8080 });

// interface User {
//   ws: WebSocket,
//   rooms: string[],
//   userId: string
// }

// const users: User[] = [];

// function checkUser(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     if (typeof decoded == "string") {
//       return null;
//     }

//     if (!decoded || !decoded.userId) {
//       return null;
//     }

//     return decoded.userId;
//   } catch(e) {
//     return null;
//   }
//   return null;
// }

// wss.on('connection', function connection(ws, request) {
//   const customWs=ws as WebSocket & {userId?:string}
//   const url = request.url;
//   if (!url) {
//     return;
//   }
//   const queryParams = new URLSearchParams(url.split('?')[1]);
//   const token = queryParams.get('token') || "";
//   const userId = checkUser(token);

//   if (userId == null) {
//     ws.close()
//     return null;
//   }
//  customWs.userId=userId;

//   users.push({
//     userId,
//     rooms: [],
//     ws:customWs
//   })

//   customWs.on('message', async function message(data) {
//     let parsedData;
//     if (typeof data !== "string") {
//       parsedData = JSON.parse(data.toString());
//     } else {
//       parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
//     }

//     if (parsedData.type === "join_room") {
//       const user = users.find(x => x.ws === ws);
//       user?.rooms.push(parsedData.roomSlug);
//     }

//     if (parsedData.type === "leave_room") {
//       const user = users.find(x => x.ws === ws);
//       if (!user) {
//         return;
//       }
//       user.rooms = user?.rooms.filter(x => x === parsedData.room);
//     }

//     console.log("message received")
//     console.log(parsedData);

//     if (parsedData.type === "chat") {
//       const roomSlug = parsedData.roomId;
//       const message = parsedData.message;

//       const room = await prismaClient.room.findUnique({
//         where: { slug: roomSlug },
//       });

//       if (!room) {
//         console.error(`❌ Room with slug ${roomSlug} not found`);
//         return;
//       }
//       console.log("🧪 Trying to create chat with userId:", userId);
//       // let user = await prismaClient.user.findUnique({
//       //   where: { id: someUserId },
//       // });

//       // if (!user) {
//       //   user = await prismaClient.user.create({
//       //     data: {
//       //       id: someUserId,
//       //       email: `guest-${Date.now()}@example.com`,
//       //       password: "not-used", // or some dummy value
//       //       name: "Guest",
//       //     },
//       //   });
//       // }
//       const user = await prismaClient.user.findUnique({
//         where: { id: userId },
//       });

//       if (!user) {
//         console.error(`❌ User with ID ${userId} not found`);
//         return;
//       }
//       const isValidUserId = (userId: string): boolean => {
//         const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
//         return uuidPattern.test(userId);
//       };

//       if (!isValidUserId(userId)) {
//         console.error(`Invalid userId: ${userId}`);
//         return;
//       }

//       const sanitizeUserId = (userId: string): string => {
//         return userId.replace(/[^a-fA-F0-9-]/g, '');
//       };

//       const sanitizedUserId = sanitizeUserId(userId);

//       if (!isValidUserId(sanitizedUserId)) {
//         console.error(`Invalid sanitized userId: ${sanitizedUserId}`);
//         return;
//       }

//       await prismaClient.chat.create({
//         data: {
//           message: message,
//           room: {
//             connect: { id: room.id },
//           },
//           user: {
//             connect: { id: userId },
//           },
//         },
//       });

//       users.forEach(user => {
//         if (user.rooms.includes(roomSlug)) {
//           user.ws.send(JSON.stringify({
//             type: "chat",
//             message: message,
//             roomSlug
//           }))
//         }
//       })
//     }

//   });

// });
//working good
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { WebSocket, WebSocketServer } from "ws";
// const { JWT_SECRET } = require("@repo/backend-common/config");
// const { prismaClient } = require("@repo/db/client");

// const wss = new WebSocketServer({ port: 8080 });

// interface User {
//   ws: WebSocket;
//   rooms: string[];
//   userId: string;
// }

// let users: User[] = [];

// type IncomingMessage =
//   | { type: "join_room"; roomSlug: string }
//   | { type: "leave_room"; roomSlug: string }
//   | { type: "chat"; roomSlug: string; message: string }
//   | {
//       type: "shape";
//       roomSlug: string;
//       shape: {
//         type: string;
//         x: number;
//         y: number;
//         width?: number;
//         height?: number;
//         radius?: number;
//         centerX?: number;
//         centerY?: number;
//         startX?: number;
//         startY?: number;
//         endX?: number;
//         endY?: number;
//       };
//     };

// function checkUser(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
//     return decoded?.userId || null;
//   } catch (e: any) {
//     console.error("JWT verification failed:", e.message);
//     return null;
//   }
// }

// wss.on("connection", async (ws: WebSocket, request: any) => {
//   const url = request?.url || "";
//   const queryParams = new URLSearchParams(url.split("?")[1]);
//   const token = queryParams.get("token") || "";
//   const userId = checkUser(token);

//   if (!userId) {
//     console.log("❌ Invalid token");
//     ws.close(1008, "Invalid Token");
//     return;
//   }

//   users = users.filter((u) => u.userId !== userId || u.ws !== ws); // dedupe
//   const user: User = { ws, rooms: [], userId };
//   users.push(user);
//   console.log(`✅ User ${userId} connected`);

//   ws.on("message", async (data: string | Buffer | ArrayBuffer | Buffer[]) => {
//     try {
//       let jsonString: string;

//       if (typeof data === "string") {
//         jsonString = data;
//       } else if (Buffer.isBuffer(data)) {
//         jsonString = data.toString("utf-8");
//       } else if (data instanceof ArrayBuffer) {
//         jsonString = Buffer.from(data).toString("utf-8");
//       } else if (Array.isArray(data)) {
//         jsonString = Buffer.concat(data).toString("utf-8");
//       } else {
//         console.error("❌ Unsupported data type received:", typeof data);
//         return;
//       }

//       console.log("📦 Received JSON string:", jsonString);

//       const parsedData = JSON.parse(jsonString) as IncomingMessage;
//       console.log("✅ Parsed JSON:", parsedData);

//       switch (parsedData.type) {
//         case "join_room": {
//           const { roomSlug } = parsedData;
//           if (!user.rooms.includes(roomSlug)) {
//             user.rooms.push(roomSlug);
//             console.log(`📥 ${userId} joined ${roomSlug}`);
//           }
//           break;
//         }

//         case "leave_room": {
//           const { roomSlug } = parsedData;
//           user.rooms = user.rooms.filter((slug) => slug !== roomSlug);
//           console.log(`📤 ${userId} left ${roomSlug}`);
//           break;
//         }

//         case "chat": {
//           const { roomSlug, message } = parsedData;
//           if (typeof message !== "string" || !message.trim()) {
//             console.log("❌ Invalid chat message");
//             return;
//           }

//           const room = await prismaClient.room.findUnique({
//             where: { slug: roomSlug },
//           });

//           if (!room) {
//             console.log(`❌ Room not found: ${roomSlug}`);
//             return;
//           }

//           const chat = await prismaClient.chat.create({
//             data: {
//               message,
//               roomId:room.id,
//               userId,
//             },
//           });

//           broadcastToRoom(roomSlug, {
//             type: "chat",
//             message: chat.message,
//             roomSlug,
//             sender: userId,
//           });
//           break;
//         }

//         case "shape": {
//           const { roomSlug, shape } = parsedData;
          

//           if (!shape?.type) {
//             console.log("❌ Invalid shape: missing type");
//             return;
//           }

//           const room = await prismaClient.room.findUnique({
//             where: { slug: roomSlug },
//           });

//           if (!room) {
//             console.error("❌ Room not found");
//             return;
//           }

//           try {
//             console.log("📐 Incoming shape data:", shape);

//             const {
//               type,
//               x,
//               y,
//               width,
//               height,
//               radius,
//               centerX,
//               centerY,
//               startX,
//               startY,
//               endX,
//               endY,
//             } = shape;

//             if (typeof x !== "number" || typeof y !== "number") {
//               throw new Error("x and y must be numbers");
//             }

//             await prismaClient.shape.create({
//               data: {
//                 type,
//                 x,
//                 y,
//                 width: width ?? null,
//                 height: height ?? null,
//                 radius: radius ?? null,
//                 centerX: centerX ?? null,
//                 centerY: centerY ?? null,
//                 startX: startX ?? null,
//                 startY: startY ?? null,
//                 endX: endX ?? null,
//                 endY: endY ?? null,
//                 room: {
//                   connect: {
//                     id: room.id,
//                   },
//                 },
//               },
//             });

//             console.log("✅ Shape created successfully");

//             broadcastToRoom(roomSlug, {
//               type: "shape",
//               shape,
//               roomSlug,
//               sender: userId,
//             });
//           } catch (e) {
//             console.error("❌ Failed to create shape:", e);
//             ws.send(
//               JSON.stringify({
//                 type: "error",
//                 message: "Failed to create shape",
//               })
//             );
//           }
//           break;
//         }

//         default:
//           console.log("⚠️ Unknown message type:", (parsedData as any).type);
//           ws.send(
//             JSON.stringify({
//               type: "error",
//               message: `Unknown message type: ${(parsedData as any).type}`,
//             })
//           );
//       }
//     } catch (e) {
//       console.error("❌ JSON parse error:", e);
//     }
//   });

//   ws.on("close", () => {
//     users = users.filter((u) => u.ws !== ws);
//     console.log(`❌ ${userId} disconnected`);
//   });
// });

// function broadcastToRoom(roomSlug: string, message: any, excludeUserId?: string) {
//   users.forEach((user) => {
//     if (user.rooms.includes(roomSlug) && user.userId !== excludeUserId) {
//       try {
//         user.ws.send(JSON.stringify(message));
//       } catch (err) {
//         console.error(`Failed to send to user ${user.userId}:`, err);
//       }
//     }
//   });
// }
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
  type: "rectangle" | "circle" | "line" | "pencil"| "arrowright" | "eraser"; // example shape types
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
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
            rect: "rectangle",
            rectangle: "rectangle",
            slash: "line",
            line: "line",
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
              x,
              y,
              width,
              height,
              radius,
              centerX,
              centerY,
              startX,
              startY,
              endX,
              endY,
            } = shape;
        
           const shapeData:any={
                type: normalizedType, // ✅ Use normalized type
                room: {
                  connect: {
                    id: room.id,
                  },
                },
              }
           
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
