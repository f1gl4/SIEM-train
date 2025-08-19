/*
  Warnings:

  - Made the column `location` on table `Incident` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Incident" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "malwareId" INTEGER NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "summary" TEXT,
    "victims" INTEGER NOT NULL,
    CONSTRAINT "Incident_malwareId_fkey" FOREIGN KEY ("malwareId") REFERENCES "Malware" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Incident" ("id", "location", "malwareId", "occurredAt", "summary", "victims") SELECT "id", "location", "malwareId", "occurredAt", "summary", "victims" FROM "Incident";
DROP TABLE "Incident";
ALTER TABLE "new_Incident" RENAME TO "Incident";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
