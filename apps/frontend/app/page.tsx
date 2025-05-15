// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// // import { Button } from "@repo/ui/button";
// // import { Card } from "@repo/ui/card";
// import {
//   Pencil,
//   Share2,
//   Users2,
//   Sparkles,
//   Github,
//   Download,
// } from "lucide-react";
// // import Link from "next/link";
// import { HTTP_BACKEND } from "@/config";
// import * as React from "react"
 
//  import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
 

// function App() {
//   const router = useRouter();
//   const [joinSlug, setJoinSlug] = useState("");

//   // 1️⃣ Create a new room
//   const createRoom = async () => {
//     try {
//       const response = await axios.post(`${HTTP_BACKEND}/room`);
//       const { roomSlug } = response.data;
//       router.push(`/canvas/${roomSlug}?guest=true`);
//     } catch (err) {
//       alert("Failed to create room.");
//     }
//   };

//   // 2️⃣ Join existing room
//   const joinRoom = () => {
//     const slug = joinSlug.trim();
//     if (slug) {
//       router.push(`/canvas/${slug}?guest=true`);
//     } else {
//       alert("Please enter a valid room ID.");
//     }
//   };
  
//   // const [slug,setSlug]=useState<string | null>(null);

//   // useEffect(()=>{
//   //   if(router.isReady){
//   //     const href=window.location.href;
//   //     const match=href.match(/\/canvas\/([^?]+)/);
//   //     const extractedSlug=match ? match[1]:null;
//   //     setSlug(extractedSlug);
//   //   }
//   // })

//   return (
//     //   <div className="min-h-screen bg-[#fef0f6]">
//     //     {/* Hero */}
//     //     <header className="relative overflow-hidden">
//     //       <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
//     //         <div className="text-center space-y-6">
//     //           <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
//     //             SketchaLot
//     //             <span className="text-primary block">Made Simple</span>
//     //           </h1>
//     //           <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
//     //             Create, collaborate, and share beautiful diagrams and sketches with our intuitive drawing tool. No sign-up required.
//     //           </p>

//     //           {/* Auth Buttons */}
//     //           <div className="mt-8 flex items-center justify-center gap-x-4">
//     //             <Link href="/signin">
//     //               <Button variant="primary" size="lg" className="h-12 px-6">
//     //                 Sign in <Pencil className="ml-2 h-4 w-4" />
//     //               </Button>
//     //             </Link>
//     //             <Link href="/signup">
//     //               <Button variant="outline" size="lg" className="h-12 px-6">
//     //                 Sign up
//     //               </Button>
//     //             </Link>
//     //           </div>

//     //           {/* Room Controls */}
//     //           <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
//     //             <Button
//     //               onClick={createRoom}
//     //               variant="secondary"
//     //               size="lg"
//     //               className="h-12 px-6"
//     //             >
//     //               Create New Room
//     //             </Button>
//     //             <div className="flex items-center gap-2">
//     //               <input
//     //                 type="text"
//     //                 placeholder="Enter Room ID"
//     //                 value={joinSlug}
//     //                 onChange={(e) => setJoinSlug(e.target.value)}
//     //                 className="h-12 px-4 border rounded-md text-lg"
//     //               />
//     //               <Button
//     //                 onClick={joinRoom}
//     //                 variant="secondary"
//     //                 size="lg"
//     //                 className="h-12 px-6"
//     //               >
//     //                 Join Room
//     //               </Button>
//     //             </div>
//     //           </div>
//     //         </div>
//     //       </div>
//     //     </header>

//     //     {/* Features */}

//     //     {/* Footer */}
//     //     <footer className="border-t">
//     //       <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
//     //         <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
//     //           <p className="text-sm text-muted-foreground">
//     //             © 2024 Excalidraw Clone. All rights reserved.
//     //           </p>
//     //           <div className="flex space-x-6">
//     //             <a
//     //               href="https://github.com"
//     //               className="text-muted-foreground hover:text-primary"
//     //             >
//     //               <Github className="h-5 w-5" />
//     //             </a>
//     //             <a
//     //               href="#"
//     //               className="text-muted-foreground hover:text-primary"
//     //             >
//     //               <Download className="h-5 w-5" />
//     //             </a>
//     //           </div>
//     //         </div>
//     //       </div>
//     //     </footer>
//     //   </div>
//     <div>
//       <Card className="w-[350px]">
//       <CardHeader>
//         <CardTitle>Create project</CardTitle>
//         <CardDescription>Deploy your new project in one-click.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form>
//           <div className="grid w-full items-center gap-4">
//             <div className="flex flex-col space-y-1.5">
//               <Label htmlFor="name">Name</Label>
//               <Input id="name" placeholder="Name of your project" />
//             </div>
//             <div className="flex flex-col space-y-1.5">
//               <Label htmlFor="framework">Framework</Label>
//               <Select>
//                 <SelectTrigger id="framework">
//                   <SelectValue placeholder="Select" />
//                 </SelectTrigger>
//                 <SelectContent position="popper">
//                   <SelectItem value="next">Next.js</SelectItem>
//                   <SelectItem value="sveltekit">SvelteKit</SelectItem>
//                   <SelectItem value="astro">Astro</SelectItem>
//                   <SelectItem value="nuxt">Nuxt.js</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </form>
//       </CardContent>
//       <CardFooter className="flex justify-between">
//         <Button variant="outline">Cancel</Button>
//         <Button>Deploy</Button>
//       </CardFooter>
//     </Card>
//     </div>
//   );
// }

// export default App;
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn } from "lucide-react";

export default function App() {
  const router = useRouter();
  const [joinSlug, setJoinSlug] = useState("");

  const createRoom = async () => {
    try {
      const res = await axios.post(`${HTTP_BACKEND}/room`);
      const { roomSlug } = res.data;
      router.push(`/canvas/${roomSlug}?guest=true`);
    } catch (err) {
      alert("Failed to create room.");
    }
  };

  const joinRoom = () => {
    const slug = joinSlug.trim();
    if (slug) {
      router.push(`/canvas/${slug}?guest=true`);
    } else {
      alert("Please enter a valid room ID.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🎨 SketchaLot</CardTitle>
          <CardDescription className="text-center">
            Create or join collaborative drawing rooms in one click.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-md">Create a New Room</Label>
            <Button onClick={createRoom} className="w-full" variant="default">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="room-id" className="text-md">Join a Room</Label>
            <Input
              id="room-id"
              placeholder="Enter Room Slug"
              value={joinSlug}
              onChange={(e) => setJoinSlug(e.target.value)}
            />
            <Button onClick={joinRoom} className="w-full mt-2" variant="secondary">
              <LogIn className="mr-2 h-4 w-4" />
              Join Room
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground justify-center">
          &copy; 2025 SketchaLot. Built with 💖 using ShadCN UI.
        </CardFooter>
      </Card>
    </div>
  );
}
