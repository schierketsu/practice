-- Removes the wrongly ordered migration log entry (folder removed from repo).
-- Run: npx prisma db execute --file prisma/sql/remove_chto_to_migration_log.sql --schema prisma/schema.prisma
DELETE FROM _prisma_migrations WHERE migration_name = '20260411102124_chto_to';
