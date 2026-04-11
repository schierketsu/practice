import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')

function diskMigrationFolders() {
  const out = []
  for (const ent of fs.readdirSync(migrationsDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue
    if (!/^\d{14}_/.test(ent.name)) continue
    const sql = path.join(migrationsDir, ent.name, 'migration.sql')
    out.push({ name: ent.name, hasSql: fs.existsSync(sql) })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

const folders = diskMigrationFolders()
const missingSql = folders.filter((f) => !f.hasSql).map((f) => f.name)
if (missingSql.length) {
  console.error('P3015: these folders are missing migration.sql:')
  for (const d of missingSql) console.error(' ', d)
  console.error('\nDelete the folder(s) (or restore migration.sql), then retry prisma migrate dev.')
}

const prisma = new PrismaClient()
let diskNames = []
let dbNamesOrdered = []
let dupes = []

try {
  diskNames = folders.filter((f) => f.hasSql).map((f) => f.name)

  const nameRows = await prisma.$queryRaw`
    SELECT migration_name FROM _prisma_migrations ORDER BY started_at
  `
  dbNamesOrdered = nameRows.map((r) => r.migration_name)

  dupes = await prisma.$queryRaw`
    SELECT migration_name, COUNT(*) AS c
    FROM _prisma_migrations
    GROUP BY migration_name
    HAVING c > 1
  `
} catch (e) {
  console.error('Could not read _prisma_migrations (is DATABASE_URL correct?)', e.message)
  await prisma.$disconnect()
  process.exit(missingSql.length ? 1 : 0)
}

const uniqueDbNames = [...new Set(dbNamesOrdered)]
const pendingOnDisk = diskNames.filter((n) => !uniqueDbNames.includes(n))

console.log('On disk:', diskNames.join(', ') || '(none)')
console.log('In DB (unique):', uniqueDbNames.join(', ') || '(none)')
if (pendingOnDisk.length) {
  console.log('\nPending (on disk, not yet in _prisma_migrations):', pendingOnDisk.join(', '))
  console.log(
    'Apply with: npx prisma migrate deploy\nIf migrate dev reports drift (e.g. User resume columns already in DB): deploy may error on duplicate column — then run:\n  npx prisma migrate resolve --applied <migration_folder_name>',
  )
}
if (dupes.length) {
  console.error('\nDuplicate rows in _prisma_migrations (corrupt log):')
  for (const row of dupes) console.error(' ', row.migration_name, '×', Number(row.c))
  console.error('\nFix: npx prisma db execute --file prisma/sql/repair_prisma_migrations.sql --schema prisma/schema.prisma')
  console.error('(after removing empty prisma/migrations/20260215120000_* folder if present)')
}

const inDbNotDisk = uniqueDbNames.filter((n) => !diskNames.includes(n))
if (inDbNotDisk.length) {
  console.error(
    '\nRecorded in DB but missing on disk (restore from git: git checkout HEAD -- prisma/migrations/<name>):',
  )
  for (const n of inDbNotDisk) console.error(' ', n)
}

await prisma.$disconnect()

const bad = missingSql.length || dupes.length || inDbNotDisk.length
if (bad) process.exit(1)
console.log('\nOK: disk layout matches applied migration names, no duplicates.')
if (pendingOnDisk.length) {
  console.log('Note: pending migrations are normal until you run migrate deploy or migrate dev.')
}
