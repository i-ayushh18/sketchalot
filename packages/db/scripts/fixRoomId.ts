import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Step 1: Add the column (if not already added)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "roomId" INTEGER;
  `);

  // Step 2: Populate roomId using roomSlug
  await prisma.$executeRawUnsafe(`
    UPDATE "Chat"
    SET "roomId" = r."id"
    FROM "Room" r
    WHERE "Chat"."roomSlug" = r."slug";
  `);

  console.log("✅ Updated rows with matching slugs.");

  // Step 3: Log rows where roomId is still null
  const missing = await prisma.chat.findMany({
    where: { roomId: null },
    select: { id: true, roomSlug: true },
  });

  if (missing.length > 0) {
    console.log("⚠️ Chats with null roomId remain:");
    console.table(missing);
    // You can choose to delete these rows if needed
    const deleteChatsWithNullRoomId = await prisma.chat.deleteMany({
      where: {
        roomId: null,
      },
    });
    console.log('Deleted rows with null roomId:', deleteChatsWithNullRoomId);
  } else {
    console.log('No chats with null roomId.');
  }

  // Step 4: Add foreign key constraint (will only work after roomId is not null)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Chat"
    ADD CONSTRAINT IF NOT EXISTS "Chat_roomId_fkey"
    FOREIGN KEY ("roomId") REFERENCES "Room"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  `);

  // Step 5: Make roomId NOT NULL
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Chat" ALTER COLUMN "roomId" SET NOT NULL;
  `);

  console.log("✅ roomId column populated and migrated successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
  })
  .finally(() => prisma.$disconnect());
