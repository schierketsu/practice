import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { mapCompany } from '../lib/mapCompany.js'
import {
  assertTechnologiesInCatalog,
  technologyUsedInCompanies,
  toUploadsUrl,
} from '../lib/technologyCatalog.js'
import { companyWriteSchema } from '../lib/validation.js'
import { Prisma, ReviewStatus, Role } from '@prisma/client'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import adminUniversitiesRoutes, {
  assertCompanyUniversitiesAndFaculty,
} from './adminUniversities.js'

const router = Router()
router.use(requireAuth, requireAdmin)
router.use(adminUniversitiesRoutes)

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads')
const imageMime = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'])

const companyLogoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_ROOT, 'companies')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safe = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext) ? ext : '.png'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safe}`)
  },
})

const uploadCompanyLogo = multer({
  storage: companyLogoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (imageMime.has(file.mimetype)) cb(null, true)
    else cb(new Error('Допустимы только изображения PNG, JPEG, WebP, GIF'))
  },
})

const companyGalleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_ROOT, 'company-gallery')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safe = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext) ? ext : '.png'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safe}`)
  },
})

const uploadCompanyGallery = multer({
  storage: companyGalleryStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (imageMime.has(file.mimetype)) cb(null, true)
    else cb(new Error('Допустимы только изображения PNG, JPEG, WebP, GIF'))
  },
})

const techIconStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_ROOT, 'tech-icons')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safe = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext) ? ext : '.png'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safe}`)
  },
})

const uploadTechIcon = multer({
  storage: techIconStorage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (imageMime.has(file.mimetype) || file.mimetype === 'image/svg+xml') cb(null, true)
    else cb(new Error('Допустимы только изображения или SVG'))
  },
})

const patchUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  blocked: z.boolean().optional(),
})

const technologyCreateBody = z.object({
  name: z.string().trim().min(1).max(80),
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

router.post('/uploads/company-logo', (req, res, next) => {
  uploadCompanyLogo.single('file')(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки'
      return res.status(400).json({ error: msg })
    }
    next()
  })
}, (req, res) => {
  const f = req.file
  if (!f) return res.status(400).json({ error: 'Нет файла (поле file)' })
  const rel = path.join('companies', f.filename).replace(/\\/g, '/')
  return res.json({ url: `/uploads/${rel}` })
})

router.post('/uploads/company-gallery', (req, res, next) => {
  uploadCompanyGallery.single('file')(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки'
      return res.status(400).json({ error: msg })
    }
    next()
  })
}, (req, res) => {
  const f = req.file
  if (!f) return res.status(400).json({ error: 'Нет файла (поле file)' })
  const rel = path.join('company-gallery', f.filename).replace(/\\/g, '/')
  return res.json({ url: `/uploads/${rel}` })
})

router.get('/technology-icons', async (_req, res) => {
  const rows = await prisma.technologyIcon.findMany({ orderBy: { name: 'asc' } })
  return res.json({
    icons: rows.map((r) => ({
      name: r.name,
      url: r.iconPath ? toUploadsUrl(r.iconPath) : null,
    })),
  })
})

router.post('/technologies', async (req, res) => {
  const parsed = technologyCreateBody.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  try {
    const row = await prisma.technologyIcon.create({
      data: { name: parsed.data.name, iconPath: null },
    })
    return res.status(201).json({ technology: { name: row.name, url: null } })
  } catch {
    return res.status(409).json({ error: 'Технология с таким именем уже есть' })
  }
})

router.delete('/technologies', async (req, res) => {
  const name = String((req.query as { name?: string }).name ?? '').trim()
  if (!name) return res.status(400).json({ error: 'Укажите query name' })
  if (await technologyUsedInCompanies(name)) {
    return res.status(409).json({ error: 'Технология указана у компаний — сначала измените компании' })
  }
  try {
    const row = await prisma.technologyIcon.findUnique({ where: { name } })
    if (!row) return res.status(404).json({ error: 'Не найдено' })
    if (row.iconPath) {
      const abs = path.join(UPLOAD_ROOT, row.iconPath)
      try {
        fs.unlinkSync(abs)
      } catch {
        /* ignore */
      }
    }
    await prisma.technologyIcon.delete({ where: { name } })
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Не удалось удалить' })
  }
})

router.post('/uploads/tech-icon', (req, res, next) => {
  uploadTechIcon.single('file')(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки'
      return res.status(400).json({ error: msg })
    }
    next()
  })
}, async (req, res) => {
  const f = req.file
  const name = String((req.body as { name?: string }).name ?? '').trim()
  if (!f || !name) return res.status(400).json({ error: 'Нужны поле file и name (имя технологии)' })
  const rel = path.join('tech-icons', f.filename).replace(/\\/g, '/')
  await prisma.technologyIcon.upsert({
    where: { name },
    create: { name, iconPath: rel },
    update: { iconPath: rel },
  })
  return res.json({ name, url: `/uploads/${rel}` })
})

/** Удаление только файла иконки; запись в БД остаётся с iconPath = null */
router.delete('/technology-icons', async (req, res) => {
  const name = String((req.query as { name?: string }).name ?? '').trim()
  if (!name) return res.status(400).json({ error: 'Укажите query name' })
  try {
    const row = await prisma.technologyIcon.findUnique({ where: { name } })
    if (!row) return res.status(404).json({ error: 'Не найдено' })
    if (row.iconPath) {
      const abs = path.join(UPLOAD_ROOT, row.iconPath)
      try {
        fs.unlinkSync(abs)
      } catch {
        /* ignore */
      }
    }
    await prisma.technologyIcon.update({ where: { name }, data: { iconPath: null } })
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Не удалось удалить файл' })
  }
})

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
  const catalogErr = await assertCompanyUniversitiesAndFaculty(d.universities, d.faculty)
  if (catalogErr) return res.status(400).json({ error: catalogErr })
  const techErr = await assertTechnologiesInCatalog(d.technologies)
  if (techErr) return res.status(400).json({ error: techErr })
  try {
    const c = await prisma.company.create({
      data: {
        slug: d.slug,
        name: d.name,
        logo: d.logo,
        description: d.description,
        technologies: d.technologies,
        sector: d.sector,
        contacts: d.contacts,
        city: d.city,
        universities: d.universities,
        faculty: d.faculty,
        lat: d.lat,
        lng: d.lng,
        galleryCount: d.galleryCount,
        galleryImages: d.galleryImages,
      },
    })
    return res.status(201).json({ company: mapCompany(c) })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ error: 'Такой адрес страницы (slug) уже занят' })
    }
    throw e
  }
})

router.put('/companies/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const parsed = companyWriteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const d = parsed.data
  const catalogErr = await assertCompanyUniversitiesAndFaculty(d.universities, d.faculty)
  if (catalogErr) return res.status(400).json({ error: catalogErr })
  const techErr = await assertTechnologiesInCatalog(d.technologies)
  if (techErr) return res.status(400).json({ error: techErr })
  try {
    const c = await prisma.company.update({
      where: { id },
      data: {
        slug: d.slug,
        name: d.name,
        logo: d.logo,
        description: d.description,
        technologies: d.technologies,
        sector: d.sector,
        contacts: d.contacts,
        city: d.city,
        universities: d.universities,
        faculty: d.faculty,
        lat: d.lat,
        lng: d.lng,
        galleryCount: d.galleryCount,
        galleryImages: d.galleryImages,
      },
    })
    return res.json({ company: mapCompany(c) })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ error: 'Такой адрес страницы (slug) уже занят' })
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return res.status(404).json({ error: 'Компания не найдена' })
    }
    throw e
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
