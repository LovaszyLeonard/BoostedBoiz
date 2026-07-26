/*
  Warnings:

  - You are about to drop the column `isCurated` on the `Engine` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displacement" TEXT NOT NULL,
    "stockHp" INTEGER NOT NULL,
    "stockTorque" INTEGER NOT NULL,
    "tuningType" TEXT,
    CONSTRAINT "Engine_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Engine" ("code", "displacement", "id", "modelId", "stockHp", "stockTorque", "tuningType") SELECT "code", "displacement", "id", "modelId", "stockHp", "stockTorque", "tuningType" FROM "Engine";
DROP TABLE "Engine";
ALTER TABLE "new_Engine" RENAME TO "Engine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
