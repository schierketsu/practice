import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const serverRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  schema: path.join(serverRoot, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(serverRoot, 'prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
