import axios from "axios"
import { BACKEND_URL } from "../app/config"
import { ChatRoomClient } from "./ChatRoomClient";
import { useSocket } from "../hooks/useSocket";
import { useState,useEffect } from "react";

async function getChats(roomId: string) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return response.data.messages;
}

export async function ChatRoom({id}: {
    id: string
}) {
    const { socket, loading } = useSocket();

  const [messages, setMessages] = useState<{ message: string }[]>([]);

  useEffect(() => {
    getChats(id).then(setMessages);
  }, [id]);

  if (loading || !socket) return <div>Loading chat...</div>;

  return <ChatRoomClient id={id} messages={messages} socket={socket} />;
}