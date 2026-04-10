import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { createReviewSchema } from '../lib/validation.js'
import { ReviewStatus } from '@prisma/client'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

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

function mapReview(r: {
  id: number
  authorDisplay: string
  text: string
  rating: number
  employment: string
  location: string
  periodLabel: string | null
  createdAt: Date
}) {
  return {
    id: r.id,
    author: r.authorDisplay,
    date: r.periodLabel ?? '',
    text: r.text,
    rating: r.rating,
    employment: r.employment,
    location: r.location,
  }
}

router.get('/', async (_req, res) => {
  const list = await prisma.company.findMany({ orderBy: { id: 'asc' } })
  return res.json({ companies: list.map(mapCompany) })
})

router.get('/:id/reviews', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const reviews = await prisma.review.findMany({
    where: { companyId: id, status: ReviewStatus.APPROVED },
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ reviews: reviews.map(mapReview) })
})

/** Статус отклика текущего пользователя по компании (для UI формы) */
router.get('/:id/my-review', requireAuth, async (req: AuthedRequest, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const r = await prisma.review.findFirst({
    where: { companyId: id, userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    select: { status: true },
  })
  if (!r) return res.json({ status: null })
  return res.json({ status: r.status })
})

/** Удалить свои отклики по компании (чтобы отправить новый на модерацию) */
router.delete('/:id/my-review', requireAuth, async (req: AuthedRequest, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const result = await prisma.review.deleteMany({
    where: { companyId: id, userId: req.user!.id },
  })
  if (result.count === 0) return res.status(404).json({ error: 'Отклик не найден' })
  return res.status(204).end()
})

router.get('/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const c = await prisma.company.findUnique({ where: { id } })
  if (!c) return res.status(404).json({ error: 'Компания не найдена' })
  return res.json({ company: mapCompany(c) })
})

router.post('/:id/reviews', requireAuth, async (req: AuthedRequest, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const parsed = createReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const { text, rating, employment, location, periodLabel } = parsed.data
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
  const duplicate = await prisma.review.findFirst({
    where: {
      companyId: id,
      userId: user.id,
      status: { in: [ReviewStatus.PENDING, ReviewStatus.APPROVED] },
    },
  })
  if (duplicate) {
    return res.status(409).json({ error: 'Отклик по этой компании уже отправлен' })
  }
  const fn = (user.firstName ?? '').trim()
  const ln = (user.lastName ?? '').trim()
  const display = fn || ln ? `${fn} ${ln}`.trim() : 'Аноним'
  const review = await prisma.review.create({
    data: {
      companyId: id,
      userId: user.id,
      authorDisplay: display,
      text,
      rating,
      employment,
      location,
      periodLabel: periodLabel || null,
      status: ReviewStatus.PENDING,
    },
  })
  return res.status(201).json({
    review: { ...mapReview(review), status: review.status },
  })
})

export default router
