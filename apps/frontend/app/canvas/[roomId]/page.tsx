import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
       
    }
}) {
    const roomId = (await params).roomId;

    return <RoomCanvas roomId={roomId}/>
}
// import { Canvas } from "@/app/components/Canvas";

// export default function CanvasPage({ params }: { params: { roomId: string } }) {
//   return <Canvas roomId={params.roomId} />;
// }
