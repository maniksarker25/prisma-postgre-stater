/*
  Warnings:

  - You are about to drop the column `education` on the `normalUsers` table. All the data in the column will be lost.
  - You are about to drop the column `profession` on the `normalUsers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "normalUsers" DROP COLUMN "education",
DROP COLUMN "profession";
