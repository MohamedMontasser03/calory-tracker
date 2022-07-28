/*
  Warnings:

  - You are about to drop the column `maxPrice` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "emailVerified" DATETIME,
    "maxCalories" INTEGER NOT NULL DEFAULT 2100,
    "admin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("admin", "email", "emailVerified", "id", "image", "maxCalories", "name") SELECT "admin", "email", "emailVerified", "id", "image", "maxCalories", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
