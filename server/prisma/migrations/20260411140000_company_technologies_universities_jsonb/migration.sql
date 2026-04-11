-- Align Company Json columns with Prisma (JSONB) after TEXT columns from prior migration.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" JSONB NOT NULL,
    "sector" TEXT NOT NULL,
    "contacts" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "universities" JSONB NOT NULL,
    "faculty" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);
INSERT INTO "new_Company" ("city", "contacts", "description", "faculty", "id", "lat", "lng", "logo", "name", "sector", "technologies", "universities")
SELECT "city", "contacts", "description", "faculty", "id", "lat", "lng", "logo", "name", "sector", "technologies", "universities" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
