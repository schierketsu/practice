-- TechnologyIcon (idempotent: table may already exist from a previous partial apply)
CREATE TABLE IF NOT EXISTS "TechnologyIcon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "iconPath" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "TechnologyIcon_name_key" ON "TechnologyIcon"("name");
