import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const roomId = params.roomId;

  return <RoomCanvas roomId={roomId} />;
}
