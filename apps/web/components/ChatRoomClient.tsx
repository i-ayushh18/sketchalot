"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id,
    socket
  }: {
    messages: { message: string }[];
    id: string;
    socket: WebSocket;
  }) {
    const [chats, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
  
    useEffect(() => {
      socket.send(JSON.stringify({
        type: "join_room",
        roomId: id
      }));
  
      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setChats(c => [...c, { message: parsedData.message }]);
        }
      };
    }, [socket, id]);
  
    return (
      <div>
        <div className="space-y-2 mb-4">
          {chats.map((m, i) => (
            <div key={i} className="bg-gray-200 p-2 rounded">{m.message}</div>
          ))}
        </div>
        <input
          className="border w-full p-2"
          type="text"
          value={currentMessage}
          onChange={e => setCurrentMessage(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            socket.send(JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage
            }));
            setCurrentMessage("");
          }}
        >
          Send message
        </button>
      </div>
    );
  }
  