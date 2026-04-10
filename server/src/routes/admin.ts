import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { companyWriteSchema } from '../lib/validation.js'
import { ReviewStatus, Role } from '@prisma/client'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

const patchUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  blocked: z.boolean().optional(),
})

const patchReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  authorDisplay: z.string().trim().min(1).max(120).optional(),
  text: z.string().trim().min(1).max(5000).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  employment: z.string().trim().min(1).max(200).optional(),
  location: z.string().trim().min(1).max(200).optional(),
  periodLabel: z.string().trim().max(100).nullable().optional(),
})

function mapCompany(c: {
  id: number
  name: string
  logo: string
  description: string
  technologies: unknown
  sector: string
  contacts: string
  city: string
  university: string
  faculty: string
  lat: number
  lng: number
}) {
  return {
    id: c.id,
    name: c.name,
    logo: c.logo,
    description: c.description,
    technologies: c.technologies as string[],
    sector: c.sector,
    contacts: c.contacts,
    city: c.city,
    university: c.university,
    faculty: c.faculty,
    coordinates: { lat: c.lat, lng: c.lng },
  }
}

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true, blocked: true, createdAt: true },
  })
  return res.json({ users })
})

router.patch('/users/:id', async (req, res) => {
  const parsed = patchUserSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const id = req.params.id
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, role: true, blocked: true, createdAt: true },
  })
  return res.json({ user: updated })
})

router.get('/companies', async (_req, res) => {
  const list = await prisma.company.findMany({ orderBy: { id: 'asc' } })
  return res.json({ companies: list.map(mapCompany) })
})

router.post('/companies', async (req, res) => {
  const parsed = companyWriteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const d = parsed.data
  const c = await prisma.company.create({
    data: {
      name: d.name,
      logo: d.logo,
      description: d.description,
      technologies: d.technologies,
      sector: d.sector,
      contacts: d.contacts,
      city: d.city,
      university: d.university,
      faculty: d.faculty,
      lat: d.lat,
      lng: d.lng,
    },
  })
  return res.status(201).json({ company: mapCompany(c) })
})

router.put('/companies/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const parsed = companyWriteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const d = parsed.data
  try {
    const c = await prisma.company.update({
      where: { id },
      data: {
        name: d.name,
        logo: d.logo,
        description: d.description,
        technologies: d.technologies,
        sector: d.sector,
        contacts: d.contacts,
        city: d.city,
        university: d.university,
        faculty: d.faculty,
        lat: d.lat,
        lng: d.lng,
      },
    })
    return res.json({ company: mapCompany(c) })
  } catch {
    return res.status(404).json({ error: 'Компания не найдена' })
  }
})

router.delete('/companies/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  try {
    await prisma.company.delete({ where: { id } })
    return res.json({ ok: true })
  } catch {
    return res.status(404).json({ error: 'Компания не найдена' })
  }
})

router.get('/reviews', async (req, res) => {
  const status = req.query.status as string | undefined
  const companyId = req.query.companyId ? parseInt(String(req.query.companyId), 10) : undefined
  const where: { status?: ReviewStatus; companyId?: number } = {}
  if (status && Object.values(ReviewStatus).includes(status as ReviewStatus)) {
    where.status = status as ReviewStatus
  }
  if (companyId !== undefined && !Number.isNaN(companyId)) {
    where.companyId = companyId
  }
  const list = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { company: { select: { id: true, name: true } } },
  })
  return res.json({
    reviews: list.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      companyName: r.company.name,
      userId: r.userId,
      authorDisplay: r.authorDisplay,
      text: r.text,
      rating: r.rating,
      employment: r.employment,
      location: r.location,
      periodLabel: r.periodLabel,
      status: r.status,
      createdAt: r.createdAt,
    })),
  })
})

router.patch('/reviews/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const parsed = patchReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  try {
    const r = await prisma.review.update({
      where: { id },
      data: parsed.data,
      include: { company: { select: { id: true, name: true } } },
    })
    return res.json({
      review: {
        id: r.id,
        companyId: r.companyId,
        companyName: r.company.name,
        userId: r.userId,
        authorDisplay: r.authorDisplay,
        text: r.text,
        rating: r.rating,
        employment: r.employment,
        location: r.location,
        periodLabel: r.periodLabel,
        status: r.status,
        createdAt: r.createdAt,
      },
    })
  } catch {
    return res.status(404).json({ error: 'Отклик не найден' })
  }
})

router.delete('/reviews/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  try {
    await prisma.review.delete({ where: { id } })
    return res.json({ ok: true })
  } catch {
    return res.status(404).json({ error: 'Отклик не найден' })
  }
})

export default router
