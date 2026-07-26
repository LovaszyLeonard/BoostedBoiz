-- CreateTable
CREATE TABLE "Make" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "makeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearStart" INTEGER,
    "yearEnd" INTEGER,
    "slug" TEXT NOT NULL,
    CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displacement" TEXT NOT NULL,
    "stockHp" INTEGER NOT NULL,
    "stockTorque" INTEGER NOT NULL,
    CONSTRAINT "Engine_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TuningStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engineId" TEXT NOT NULL,
    "stageNumber" INTEGER NOT NULL,
    "requiredMods" TEXT NOT NULL,
    "hpGain" INTEGER NOT NULL,
    "torqueGain" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "TuningStage_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Make_name_key" ON "Make"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Make_slug_key" ON "Make"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");
