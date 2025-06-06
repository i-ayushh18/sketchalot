// import dotenv from "dotenv";
// dotenv.config();
// import {randomBytes} from "crypto"
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const { JWT_SECRET } = require("@repo/backend-common/config");
// const { middleware } = require("./middleware");
// const { CreateUserSchema, SignInSchema,RoomIdSchema } = require("@repo/common/types");  //cjs
// const { prismaClient } = require("@repo/db/client");
// const cors = require("cors");


// const app = express();


// const allowedOrigins = [
//   "http://localhost:3001",
//   "https://sketchalot.onrender.com"
// ];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));


// app.post("/signup", async (req, res) => {

//     const parsedData = CreateUserSchema.safeParse(req.body);
//     if (!parsedData.success) {
//         console.log(parsedData.error);
//         res.json({
//             message: "Incorrect inputs"
//         })
//         return;
//     }
//     try {
//         const user = await prismaClient.user.create({
//             data: {
//                 email: parsedData.data?.username,
//                 // TODO: Hash the pw
//                 password: parsedData.data.password,
//                 name: parsedData.data.name
//             }
//         })
//         res.json({
//             userId: user.id
//         })
//     } catch(e) {
//         res.status(411).json({
//             message: "User already exists with this username"
//         })
//     }
// })

// app.post("/signin", async (req, res) => {
//     const parsedData = SignInSchema.safeParse(req.body);
//     if (!parsedData.success) {
//         res.json({
//             message: "Incorrect inputs"
//         })
//         return;
//     }

//     // TODO: Compare the hashed pws here
//     const user = await prismaClient.user.findFirst({
//         where: {
//             email: parsedData.data.username,
//             password: parsedData.data.password
//         }
//     })

//     if (!user) {
//         res.status(403).json({
//             message: "Not authorized"
//         })
//         return;
//     }

//     const token = jwt.sign({
//         userId: user?.id
//     }, JWT_SECRET);

//     res.json({
//         token
//     })
// })

// // app.post("/room", middleware, async (req, res) => {
// //     const parsedData = RoomIdSchema.safeParse(req.body);
// //     if (!parsedData.success) {
// //         res.json({
// //             message: "Incorrect inputs"
// //         })
// //         return;
// //     }
// //     // @ts-ignore: TODO: Fix this
// //     const userId = req.userId;

// //     try {
// //         const room = await prismaClient.room.create({
// //             data: {
// //                 slug: parsedData.data.name,
// //                 adminId: userId
// //             }
// //         })

// //         res.json({
// //             roomId: room.id
// //         })
// //     } catch(e) {
// //         res.status(411).json({
// //             message: "Room already exists with this name"
// //         })
// //     }
// // })

  
//   // Get room by slug
//   app.get("/room/:slug", async (req, res) => {
//     const slug = req.params.slug;
//     const room = await prismaClient.room.findFirst({
//       where: { slug },
//     });
  
//     if (!room) {
//       return res.status(404).json({ error: "Room not found" });
//     }
  
//     res.json({ room });
//   });
  

// app.get("/chats/:roomId", async (req, res) => {
//     try {
//         const roomId = Number(req.params.roomId);
//         console.log(req.params.roomId);
//         if(isNaN(roomId)){
//             return res.status(404).json({error:"Invalid room ID"})
//         }
//         const messages = await prismaClient.chat.findMany({
//             where: {
//                 roomId: roomId
//             },
//             orderBy: {
//                 id: "desc"
//             },
//             take: 1000
//         });

//         res.json({
//             messages
//         })
//     } catch(e) {
//         console.log(e);
//         res.json({
//             messages: []
//         })
//     }
    
// })
// app.post("/chats/:roomId", middleware, async (req, res) => {
//     const roomId = Number(req.params.roomId);
//     const userId = req.userId; // make sure your middleware sets this!
//     const { message } = req.body;
  
//     if (!message || typeof message !== "string") {
//       return res.status(400).json({ error: "Invalid message format" });
//     }
  
//     try {
//       await prismaClient.chat.create({
//         data: {
//           message,
//           room: {
//             connect: { id: roomId },
//           },
//           user: {
//             connect: { id: userId }, 
//           },
//         },
//       });
  
//       res.json({ success: true });
//     } catch (e) {
//       console.error("Failed to create chat:", e);
//       res.status(500).json({ error: "Could not save message" });
//     }
//   });
  
// app.get("/room/:slug", async (req, res) => {
//     const slug = req.params.slug;
//     const room = await prismaClient.room.findFirst({
//         where: {
//             slug
//         }
//     });

//     res.json({
//         room
//     })
// })
// app.post("/room/:slug", middleware, async (req, res) => {
//   const roomSlug = req.params.slug;
//   const userId = req.userId;
//   const { message } = req.body;

//   try {
//     await prismaClient.chat.create({
//       data: {
//         message,
//         room: {
//           connect: { slug: roomSlug },
//         },
//         user: {
//           connect: { id: userId },
//         },
//       },
//     });
//     res.json({ success: true });
//   } catch (e) {
//     console.error("failed to create chat", e);
//     res.status(500).json({ error: "could not save message" });
//   }
// });
// //new
// app.post("/room", async (req, res) => {
//     // Generate a random slug for the room
//     const roomSlug = randomBytes(4).toString("hex");

//     try {
//         // Create the room (no user ID is required, just the slug)
//         const room = await prismaClient.room.create({
//             data: {
//                 slug: roomSlug,
//             },
//         });

//         res.json({ roomSlug: room.slug });
//     } catch (e) {
//         console.error("❌ Failed to create room:", e);
//         res.status(500).json({ error: "Could not create room" });
//     }
// });

// app.post("/room/:slug", async (req, res) => {
//     const roomSlug = req.params.slug;
//     const { message } = req.body;

//     // Ensure the message is in a valid format
//     if (!message || typeof message !== "string") {
//         return res.status(400).json({ error: "Invalid message format" });
//     }

//     // Since messages will not be saved, we will just simulate the action (no DB operation)
//     console.log(`Guest message posted in room ${roomSlug}: ${message}`);

//     res.json({ success: true });
// });


// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`HTTP Backend running on port ${PORT}`);
// });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { WebSocketServer } = require("ws");

const { JWT_SECRET } = require("@repo/backend-common/config");
const { middleware } = require("./middleware");
const { CreateUserSchema, SignInSchema, RoomIdSchema } = require("@repo/common/types");
const { prismaClient } = require("@repo/db/client");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
const allowedOrigins = [
  "http://localhost:3001",
  "https://sketchalot.onrender.com"
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json()); // Needed to parse req.body

// ---- Auth Endpoints ----

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: parsedData.data.password,
        name: parsedData.data.name
      }
    });
    res.json({ userId: user.id });
  } catch (e) {
    res.status(409).json({ message: "User already exists" });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password
    }
  });

  if (!user) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token });
});

// ---- Room Endpoints ----

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({ where: { slug } });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room });
});

app.post("/room", async (req, res) => {
  const roomSlug = randomBytes(4).toString("hex");
  try {
    const room = await prismaClient.room.create({ data: { slug: roomSlug } });
    res.json({ roomSlug: room.slug });
  } catch (e) {
    res.status(500).json({ error: "Could not create room" });
  }
});

// ---- Chat Endpoints ----

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  if (isNaN(roomId)) return res.status(400).json({ error: "Invalid room ID" });

  const messages = await prismaClient.chat.findMany({
    where: { roomId },
    orderBy: { id: "desc" },
    take: 1000
  });

  res.json({ messages });
});

app.post("/chats/:roomId", middleware, async (req, res) => {
  const roomId = Number(req.params.roomId);
  const userId = req.userId;
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message format" });
  }

  try {
    await prismaClient.chat.create({
      data: {
        message,
        room: { connect: { id: roomId } },
        user: { connect: { id: userId } },
      }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Could not save message" });
  }
});

// ---- WebSocket Server ----

const server = app.listen(PORT, () => {
  console.log(`🚀 HTTP + WS server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace(/^\/\?/, ""));
  const token = params.get("token");

  if (!token) {
    ws.close();
    return;
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    ws.close();
    return;
  }

  console.log("✅ WebSocket connection established for user:", userId);

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ WebSocket disconnected");
  });
});
