import { ChatRoom } from "../../../components/ChatRoom";
import getRoomId from "../../../../frontend/lib/getRoomId";

export interface PageProps {
  params: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function RoomPage({ params }: PageProps) {
  const resolvedParams = await params;

  if (!resolvedParams.slug || Array.isArray(resolvedParams.slug)) {
    throw new Error("Invalid slug parameter");
  }

  const roomId = await getRoomId(resolvedParams.slug);

  return <ChatRoom id={roomId} />;
}
