import {randomBytes} from "crypto"
const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("@repo/backend-common/config");
const { middleware } = require("./middleware");
const { CreateUserSchema, SignInSchema,RoomIdSchema } = require("@repo/common/types");  //cjs
const { prismaClient } = require("@repo/db/client");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SignInSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    // TODO: Compare the hashed pws here
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);

    res.json({
        token
    })
})

// app.post("/room", middleware, async (req, res) => {
//     const parsedData = RoomIdSchema.safeParse(req.body);
//     if (!parsedData.success) {
//         res.json({
//             message: "Incorrect inputs"
//         })
//         return;
//     }
//     // @ts-ignore: TODO: Fix this
//     const userId = req.userId;

//     try {
//         const room = await prismaClient.room.create({
//             data: {
//                 slug: parsedData.data.name,
//                 adminId: userId
//             }
//         })

//         res.json({
//             roomId: room.id
//         })
//     } catch(e) {
//         res.status(411).json({
//             message: "Room already exists with this name"
//         })
//     }
// })

  
  // Get room by slug
  app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
      where: { slug },
    });
  
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
  
    res.json({ room });
  });
  

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        if(isNaN(roomId)){
            return res.status(404).json({error:"Invalid room ID"})
        }
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})
app.post("/chats/:roomId", middleware, async (req, res) => {
    const roomId = Number(req.params.roomId);
    const userId = req.userId; // make sure your middleware sets this!
    const { message } = req.body;
  
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }
  
    try {
      await prismaClient.chat.create({
        data: {
          message,
          room: {
            connect: { id: roomId },
          },
          user: {
            connect: { id: userId }, // ✅ Required
          },
        },
      });
  
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to create chat:", e);
      res.status(500).json({ error: "Could not save message" });
    }
  });
  
app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})
app.post("/room/:slug", middleware, async (req, res) => {
  const roomSlug = req.params.slug;
  const userId = req.userId;
  const { message } = req.body;

  try {
    await prismaClient.chat.create({
      data: {
        message,
        room: {
          connect: { slug: roomSlug },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    res.json({ success: true });
  } catch (e) {
    console.error("failed to create chat", e);
    res.status(500).json({ error: "could not save message" });
  }
});
//new
app.post("/room", async (req, res) => {
    // Generate a random slug for the room
    const roomSlug = randomBytes(4).toString("hex");

    try {
        // Create the room (no user ID is required, just the slug)
        const room = await prismaClient.room.create({
            data: {
                slug: roomSlug,
            },
        });

        res.json({ roomSlug: room.slug });
    } catch (e) {
        console.error("❌ Failed to create room:", e);
        res.status(500).json({ error: "Could not create room" });
    }
});

app.post("/room/:slug", async (req, res) => {
    const roomSlug = req.params.slug;
    const { message } = req.body;

    // Ensure the message is in a valid format
    if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Invalid message format" });
    }

    // Since messages will not be saved, we will just simulate the action (no DB operation)
    console.log(`Guest message posted in room ${roomSlug}: ${message}`);

    res.json({ success: true });
});


app.listen(4000);//change