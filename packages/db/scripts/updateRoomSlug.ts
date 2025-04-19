// updateRoomSlug.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function updateRoomSlugs() {
  const chats = await prisma.chat.findMany({
    include: { room: true },
  })

  for (const chat of chats) {
    if (chat.room?.slug) {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { roomSlug: chat.room.slug },
      })
    }
  }

  console.log('✅ Updated roomSlug for all chats.')
}

updateRoomSlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
