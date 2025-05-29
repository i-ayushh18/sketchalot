// import axios from "axios";
// import { BACKEND_URL } from "../../config";
// import { ChatRoom } from "../../../components/ChatRoom";

import { ChatRoom } from "../../../components/ChatRoom";
import {getRoomId} from "../../../../frontend/lib/getRoomId"
// async function getRoomId(slug: string) {
//   const response = await axios.get(`${BACKEND_URL}/room/${encodeURIComponent(slug)}`);
//   return response.data.room.id;
// }

// export default async function Page({ params }: { params: { slug: string } }) {
//   const slug = params.slug;
//   console.log(slug);
  
//   const roomId = await getRoomId(slug);

//   return <ChatRoom slug={slug}/>;
// }
// import axios from "axios";
// import { BACKEND_URL } from "../../config";

// async function getRoomId(slug: string) {
//     const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
//     console.log(response.data);
//     return response.data.room.id;
// }

export default async function ({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const slug = params.slug;
  const roomId = await getRoomId(slug); // assuming getRoomId is a fetch call

  return <ChatRoom id={roomId} />;
}
