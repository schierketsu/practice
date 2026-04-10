import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import companiesRoutes from './routes/companies.js'
import adminRoutes from './routes/admin.js'

export const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/companies', companiesRoutes)
app.use('/api/admin', adminRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Не найдено' }))
