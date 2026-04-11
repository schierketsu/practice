-- Prefer prisma/sql/repair_prisma_migrations.sql (dedupes + removes legacy name).
-- This file kept for a one-off legacy delete only:
DELETE FROM _prisma_migrations WHERE migration_name = '20260215120000_company_universities_tech_icons';
