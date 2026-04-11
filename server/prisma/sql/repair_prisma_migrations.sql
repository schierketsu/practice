-- Fixes corrupted _prisma_migrations (duplicate rows, removed legacy migration name).
-- Run AFTER: delete empty folder prisma/migrations/20260215120000_company_universities_tech_icons
-- Restore missing migrations from git if needed, e.g.:
--   git checkout HEAD -- prisma/migrations/20260410145649
--
-- Apply:
--   npx prisma db execute --file prisma/sql/repair_prisma_migrations.sql --schema prisma/schema.prisma

-- Drop duplicate rows per migration_name (keep one row per name; MIN(id) is stable for Prisma TEXT ids)
DELETE FROM _prisma_migrations
WHERE id NOT IN (
  SELECT keep_id FROM (
    SELECT MIN(id) AS keep_id FROM _prisma_migrations GROUP BY migration_name
  )
);

-- Legacy folder removed from repo (replaced by 20260411130000 + 20260411130100)
DELETE FROM _prisma_migrations WHERE migration_name = '20260215120000_company_universities_tech_icons';
