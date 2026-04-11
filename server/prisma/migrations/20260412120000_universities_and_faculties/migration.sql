-- CreateTable
CREATE TABLE "University" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

CREATE UNIQUE INDEX "University_name_key" ON "University"("name");

-- CreateTable
CREATE TABLE "Faculty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "universityId" INTEGER NOT NULL,
    CONSTRAINT "Faculty_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Faculty_universityId_name_key" ON "Faculty"("universityId", "name");

INSERT INTO "University" ("name") VALUES
  ('ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'),
  ('МГУ им. М. В. Ломоносова'),
  ('СПбГУ'),
  ('НИУ ВШЭ'),
  ('МФТИ'),
  ('КНИТУ-КАИ');

INSERT INTO "Faculty" ("name", "universityId")
SELECT 'факультет ИВТ', "id" FROM "University" WHERE "name" = 'ЧУВГУ ИМ. И. Н. УЛЬЯНОВА';
