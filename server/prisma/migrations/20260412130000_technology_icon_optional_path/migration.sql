PRAGMA foreign_keys=OFF;
CREATE TABLE "TechnologyIcon_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "iconPath" TEXT
);

INSERT INTO "TechnologyIcon_new" ("id", "name", "iconPath") SELECT "id", "name", "iconPath" FROM "TechnologyIcon";

DROP TABLE "TechnologyIcon";
ALTER TABLE "TechnologyIcon_new" RENAME TO "TechnologyIcon";

CREATE UNIQUE INDEX "TechnologyIcon_name_key" ON "TechnologyIcon"("name");
PRAGMA foreign_keys=ON;

INSERT OR IGNORE INTO "TechnologyIcon" ("name") VALUES
  ('PHP'), ('TypeScript'), ('Vue'), ('Flutter'), ('C#'), ('C++'), ('Python'), ('FastAPI'), ('Laravel'),
  ('Kotlin'), ('Entity'), ('React'), ('1C CRM'), ('1C'), ('JavaScript'), ('CSS'), ('Tailwind CSS'),
  ('Django'), ('Dart'), ('PostgreSQL'), ('Angular'), ('C'), ('Битрикс');
