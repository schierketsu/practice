-- TechStackGroup: FRONTEND | BACKEND (SQLite stores enum as TEXT)
ALTER TABLE "TechnologyIcon" ADD COLUMN "stackGroup" TEXT NOT NULL DEFAULT 'BACKEND';

UPDATE "TechnologyIcon" SET "stackGroup" = 'FRONTEND' WHERE "name" IN ('Vue', 'React', 'TypeScript', 'Flutter');
