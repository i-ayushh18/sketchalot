-- CreateTable
CREATE TABLE "Shape" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "radius" INTEGER,
    "centerX" INTEGER,
    "centerY" INTEGER,
    "startX" INTEGER,
    "startY" INTEGER,
    "endX" INTEGER,
    "endY" INTEGER,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "Shape_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
