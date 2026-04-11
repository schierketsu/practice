import path from 'path'
import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma.js'
import { toUploadsUrl } from './lib/technologyCatalog.js'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import companiesRoutes from './routes/companies.js'
import adminRoutes from './routes/admin.js'

export const app = express()

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(UPLOAD_ROOT))

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

/** Справочник вузов и факультетов (для фильтров и форм) */
app.get('/api/technologies', async (_req, res) => {
  try {
    const rows = await prisma.technologyIcon.findMany({ orderBy: { name: 'asc' } })
    return res.json({
      technologies: rows.map((r) => ({
        name: r.name,
        iconUrl: r.iconPath ? toUploadsUrl(r.iconPath) : null,
      })),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Не удалось загрузить справочник технологий' })
  }
})

app.get('/api/universities', async (_req, res) => {
  try {
    const list = await prisma.university.findMany({
      orderBy: { name: 'asc' },
      include: { faculties: { orderBy: { name: 'asc' } } },
    })
    return res.json({
      universities: list.map((u) => ({
        id: u.id,
        name: u.name,
        faculties: u.faculties.map((f) => ({ id: f.id, name: f.name })),
      })),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Не удалось загрузить вузы' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/companies', companiesRoutes)
app.use('/api/admin', adminRoutes)

/** Публично: кастомные иконки технологий (путь относительно /uploads/) */
app.get('/api/technology-icons', async (_req, res) => {
  try {
    const rows = await prisma.technologyIcon.findMany({
      where: { iconPath: { not: null } },
      orderBy: { name: 'asc' },
    })
    const icons: Record<string, string> = {}
    for (const r of rows) {
      if (!r.iconPath) continue
      icons[r.name] = toUploadsUrl(r.iconPath)
    }
    return res.json({ icons })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Не удалось загрузить иконки' })
  }
})

app.use((_req, res) => res.status(404).json({ error: 'Не найдено' }))
