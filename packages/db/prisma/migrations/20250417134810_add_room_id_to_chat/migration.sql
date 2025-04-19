-- Step 1: Add roomId as nullable
ALTER TABLE "Chat" ADD COLUMN "roomId" INTEGER;

-- Step 2: Populate it using existing roomSlug
UPDATE "Chat"
SET "roomId" = r."id"
FROM "Room" r
WHERE "Chat"."roomSlug" IS NOT NULL AND r."slug" = "Chat"."roomSlug";

-- Step 3: Add foreign key
ALTER TABLE "Chat"
ADD CONSTRAINT "Chat_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 4: Make roomId NOT NULL
ALTER TABLE "Chat"
ALTER COLUMN "roomId" SET NOT NULL;
