 
// console.log("🚀 ChatRoomClient rendered");

// import { useEffect, useState } from "react";
// import { useSocket } from "../hooks/useSocket";

// interface Shape {
//   type: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   color: string;
// }

// interface ChatRoomClientProps {
//   messages: any[];  // This will now handle both chat messages and shapes
//   id: string;
//   slug: string;
// }

// export function ChatRoomClient({ messages, id, slug }: ChatRoomClientProps) {
//   const [shapes, setShapes] = useState<Shape[]>([]);
// //   const { socket, loading } = useSocket();
//   const [currentMessage, setCurrentMessage] = useState("");

// //   useEffect(() => {
// //     if (!loading && socket) {
// //       if (socket.readyState === WebSocket.OPEN) {
// //         socket.send(
// //           JSON.stringify({
// //             type: "join_room",
// //             roomSlug: slug,
// //           })
// //         );
// //         console.log("Sent join_room");
// //       } else {
// //         // Wait until socket is open
// //         socket.addEventListener("open", () => {
// //           socket.send(
// //             JSON.stringify({
// //               type: "join_room",
// //               roomSlug: slug,
// //             })
// //           );
// //           console.log("Sent join_room after open");
// //         });
// //       }
// //     }
// //   }, [socket, loading, id]);
// //OR
// const { socket } = useSocket();
// console.log("🧪 socket from useSocket:", socket);


// useEffect(() => {
//   if (!socket) return;

//   const handleOpen = () => {
//     console.log("✅ WebSocket OPEN, sending join_room");
//     socket.send(
//       JSON.stringify({
//         type: "join_room",
//         roomSlug: slug,
//       })
//     );
//   };

//   if (socket.readyState === WebSocket.OPEN) {
//     handleOpen();
//   } else {
//     socket.addEventListener("open", handleOpen);
//     return () => socket.removeEventListener("open", handleOpen);
//   }
// }, [socket, slug]);



//   //     socket.onmessage = (event) => {
//   //       const parsedData = JSON.parse(event.data);
//   //       if (parsedData.type === "shape") {
//   //         setShapes((prevShapes) => [...prevShapes, parsedData.shape]);
//   //       }
//   //     };
//   //   }
//   // }, [socket, loading, id]);
// //   useEffect(() => {
// //     if (!loading && socket) {
// //       socket.onmessage = (event) => {
// //         const parsed = JSON.parse(event.data);
// //         if (parsed.type === "shape") {
// //           setShapes((prev) => [...prev, parsed.shape]);
// //         }
// //       };
// //     }
// //   }, [socket, loading]);
// //OR
// useEffect(() => {
//     if (!socket) return;
  
//     const handleOpen = () => {
//       console.log("✅ WebSocket OPEN, sending join_room");
//       socket.send(
//         JSON.stringify({
//           type: "join_room",
//           roomSlug: slug,
//         })
//       );
//     };
  
//     if (socket.readyState === WebSocket.OPEN) {
//       handleOpen();
//     } else {
//       socket.addEventListener("open", handleOpen);
//       return () => socket.removeEventListener("open", handleOpen);
//     }
//   }, [socket, slug]);
  
  

//   const handleSendShape = (shape: Shape) => {
//     socket?.send(
//       JSON.stringify({
//         type: "shape",
//         roomSlug: slug,
//         shape: shape,
//       })
//     );
//   };

//   return (
//     <div>
//       <h2 className="font-bold text-lg">Room: {slug}</h2>
      
//       {/* Render shapes */}
//       {shapes.map((shape, index) => (
//         <div
//           key={index}
//           style={{
//             position: "absolute",
//             left: shape.x,
//             top: shape.y,
//             width: shape.width,
//             height: shape.height,
//             backgroundColor: shape.color,
//           }}
//         >
//           {/* Here you can render different shapes based on the type */}
//         </div>
//       ))}
      
//       {/* Input for chat */}
//       {messages.map((m, i) => (
//         <div key={i}>{m.message}</div>
//       ))}

//       <input
//         type="text"
//         value={currentMessage}
//         onChange={(e) => setCurrentMessage(e.target.value)}
//       />
//       <button onClick={() => handleSendShape({ type: 'rectangle', x: 100, y: 100, width: 150, height: 75, color: '#ff5733' })}>
//         Send Shape
//       </button>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id
}: {
    messages: {message: string}[];
    id: string
}) {
    const [chats, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const {socket, loading} = useSocket();

    useEffect(() => {
        if (socket && !loading) {

            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, {message: parsedData.message}])
                }
            }
        }
    }, [socket, loading, id])

    return <div>
        {chats.map(m => <div>{m.message}</div>)}

        <input type="text" value={currentMessage} onChange={e => {
            setCurrentMessage(e.target.value);
        }}></input>
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: "chat",
                roomId: id,
                message: currentMessage
            }))

            setCurrentMessage("");
        }}>Send message</button>
    </div>
}