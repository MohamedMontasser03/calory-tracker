/*
  Warnings:

  - You are about to alter the column `calories` on the `FoodEntry` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "price" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FoodEntry" ("calories", "date", "id", "name", "price", "userId") SELECT "calories", "date", "id", "name", "price", "userId" FROM "FoodEntry";
DROP TABLE "FoodEntry";
ALTER TABLE "new_FoodEntry" RENAME TO "FoodEntry";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
