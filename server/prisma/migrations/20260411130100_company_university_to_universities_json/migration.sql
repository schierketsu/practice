-- Redefine Company: university -> universities (JSON array)
PRAGMA foreign_keys=OFF;
CREATE TABLE "Company_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "contacts" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "universities" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);

INSERT INTO "Company_new" ("id", "name", "logo", "description", "technologies", "sector", "contacts", "city", "universities", "faculty", "lat", "lng")
SELECT "id", "name", "logo", "description", "technologies", "sector", "contacts", "city", json_array(university), "faculty", "lat", "lng"
FROM "Company";

DROP TABLE "Company";
ALTER TABLE "Company_new" RENAME TO "Company";
PRAGMA foreign_keys=ON;
