/*
  Warnings:

  - Made the column `x` on table `Shape` required. This step will fail if there are existing NULL values in that column.
  - Made the column `y` on table `Shape` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shape" ALTER COLUMN "x" SET NOT NULL,
ALTER COLUMN "y" SET NOT NULL;
