import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { findCompanyByRouteSegment } from '../lib/companyRoute.js'
import { mapCompany } from '../lib/mapCompany.js'
import { createReviewSchema, practiceApplicationSchema } from '../lib/validation.js'
import {
  extractContactEmail,
  getMailFromAddress,
  isMailConfigured,
  sendPracticeApplicationMail,
} from '../lib/mail.js'
import { ReviewStatus } from '@prisma/client'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

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
  const company = await findCompanyByRouteSegment(String(req.params.id))
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const id = company.id
  const reviews = await prisma.review.findMany({
    where: { companyId: id, status: ReviewStatus.APPROVED },
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ reviews: reviews.map(mapReview) })
})

/** Статус отклика текущего пользователя по компании (для UI формы) */
router.get('/:id/my-review', requireAuth, async (req: AuthedRequest, res) => {
  const company = await findCompanyByRouteSegment(String(req.params.id))
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const id = company.id
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
  const company = await findCompanyByRouteSegment(String(req.params.id))
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const id = company.id
  const result = await prisma.review.deleteMany({
    where: { companyId: id, userId: req.user!.id },
  })
  if (result.count === 0) return res.status(404).json({ error: 'Отклик не найден' })
  return res.status(204).end()
})

/** Заявка на практику: письмо компании на e-mail из поля «Контакты» */
router.post('/:id/practice-application', requireAuth, async (req: AuthedRequest, res) => {
  if (!isMailConfigured()) {
    return res.status(503).json({ error: 'Отправка почты не настроена на сервере (SMTP).' })
  }
  const from = getMailFromAddress()
  if (!from) {
    return res.status(503).json({ error: 'Не задан адрес отправителя (MAIL_FROM или SMTP_USER).' })
  }
  const company = await findCompanyByRouteSegment(String(req.params.id))
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const to = extractContactEmail(company.contacts)
  if (!to) {
    return res.status(400).json({
      error: 'В контактах компании не найден e-mail. Попросите организацию указать почту в поле «Контакты».',
    })
  }
  const parsed = practiceApplicationSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const user = req.user!
  try {
    await sendPracticeApplicationMail({
      to,
      from,
      replyTo: user.email,
      studentFirstName: user.firstName ?? '',
      studentLastName: user.lastName ?? '',
      studentEmail: user.email,
      companyName: company.name,
      coverLetter: parsed.data.coverLetter,
    })
  } catch (e: unknown) {
    console.error('practice-application mail', e)
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code?: string }).code) : ''
    if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ESOCKET') {
      return res.status(502).json({
        error:
          'Не удалось подключиться к SMTP (провайдер/файрвол часто блокируют порты 465/587). Варианты: запуск API на VPS с тем же .env; либо для локальной проверки в server/.env задайте MAIL_MODE=log — письмо выведется в консоль сервера, без сети.',
      })
    }
    return res.status(502).json({ error: 'Не удалось отправить письмо. Попробуйте позже.' })
  }
  return res.status(204).end()
})

router.get('/:id', async (req, res) => {
  const c = await findCompanyByRouteSegment(String(req.params.id))
  if (!c) return res.status(404).json({ error: 'Компания не найдена' })
  return res.json({ company: mapCompany(c) })
})

router.post('/:id/reviews', requireAuth, async (req: AuthedRequest, res) => {
  const company = await findCompanyByRouteSegment(String(req.params.id))
  if (!company) return res.status(404).json({ error: 'Компания не найдена' })
  const id = company.id
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
