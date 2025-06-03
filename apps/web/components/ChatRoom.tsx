"use client";

import { useEffect, useState } from "react";
import { ChatRoomClient } from "./ChatRoomClient";
import { useSocket } from "../hooks/useSocket";
import axios from "axios";
import { BACKEND_URL } from "../app/config";

export function ChatRoom({ id }: { id: string }) {
  const { socket, loading } = useSocket();
  const [messages, setMessages] = useState<{ message: string }[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/chats/${id}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      }
    };

    fetchChats();
  }, [id]);

  if (loading || !socket) return <div>Loading chat...</div>;

  return <ChatRoomClient id={id} messages={messages} socket={socket} />;
}
