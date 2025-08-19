-- CreateTable
CREATE TABLE "Malware" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "firstSeen" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "referenceUrl" TEXT
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "malwareId" INTEGER NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "location" TEXT,
    "summary" TEXT NOT NULL,
    CONSTRAINT "Incident_malwareId_fkey" FOREIGN KEY ("malwareId") REFERENCES "Malware" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Malware_name_key" ON "Malware"("name");
