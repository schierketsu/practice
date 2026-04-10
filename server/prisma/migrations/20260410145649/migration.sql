/*
  Warnings:

  - You are about to alter the column `technologies` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
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
    "university" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);
INSERT INTO "new_Company" ("city", "contacts", "description", "faculty", "id", "lat", "lng", "logo", "name", "sector", "technologies", "university") SELECT "city", "contacts", "description", "faculty", "id", "lat", "lng", "logo", "name", "sector", "technologies", "university" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
