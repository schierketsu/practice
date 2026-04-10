import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { changePasswordSchema, updateProfileSchema } from '../lib/validation.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads')

/**
 * Имя из multipart: UTF-8 байты часто приходят как Latin-1 → «Ð ÐÐ...».
 * Если в строке уже есть кириллица — не трогаем (иначе Buffer.from(..., 'latin1') испортит имя).
 */
function decodeMultipartFilename(name: string): string {
  if (!name) return name
  const hasCyr = (s: string) => /[\u0400-\u04FF\u0500-\u052F]/.test(s)
  if (hasCyr(name)) {
    return name
  }
  const fixed = Buffer.from(name, 'latin1').toString('utf8')
  if (hasCyr(fixed) && !/�/.test(fixed)) {
    return fixed
  }
  return name
}

const allowedMime = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_ROOT, 'resumes')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthedRequest).user!.id
    const decoded = decodeMultipartFilename(file.originalname)
    const ext = path.extname(decoded).toLowerCase()
    const safeExt = ext && ['.pdf', '.doc', '.docx'].includes(ext) ? ext : '.pdf'
    cb(null, `${userId}-${Date.now()}${safeExt}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Допустимы только PDF или Word (.doc, .docx)'))
    }
  },
})

router.use(requireAuth)

function profileUser(u: {
  id: string
  email: string
  role: string
  firstName: string | null
  lastName: string | null
  createdAt: Date
  resumeStoredPath: string | null
  resumeOriginalName: string | null
  resumeUploadedAt: Date | null
}) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    createdAt: u.createdAt,
    resumeOriginalName: u.resumeOriginalName,
    resumeUploadedAt: u.resumeUploadedAt?.toISOString() ?? null,
    hasResume: !!(u.resumeStoredPath && u.resumeOriginalName),
  }
}

function unlinkResumeFile(storedPath: string | null) {
  if (!storedPath) return
  const abs = path.join(UPLOAD_ROOT, storedPath)
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs)
  } catch {
    /* ignore */
  }
}

router.get('/', async (req: AuthedRequest, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
  return res.json({ user: profileUser(u) })
})

router.put('/', async (req: AuthedRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const { firstName, lastName } = parsed.data
  const u = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      firstName: firstName.length > 0 ? firstName : null,
      lastName: lastName.length > 0 ? lastName : null,
    },
  })
  return res.json({ user: profileUser(u) })
})

router.post(
  '/resume',
  (req, res, next) => {
    upload.single('resume')(req, res, (err: unknown) => {
      if (err) {
        const e = err as Error & { code?: string }
        const msg =
          e.code === 'LIMIT_FILE_SIZE'
            ? 'Файл больше 5 МБ'
            : e.message || 'Ошибка загрузки'
        return res.status(400).json({ error: msg })
      }
      next()
    })
  },
  async (req: AuthedRequest, res) => {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'Выберите файл' })
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
    if (user.resumeStoredPath) {
      unlinkResumeFile(user.resumeStoredPath)
    }
    const relative = path.join('resumes', file.filename).replace(/\\/g, '/')
    const orig = decodeMultipartFilename(file.originalname).slice(0, 200)
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        resumeStoredPath: relative,
        resumeOriginalName: orig,
        resumeUploadedAt: new Date(),
      },
    })
    return res.json({ user: profileUser(updated) })
  }
)

router.get('/resume/file', async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
  if (!user.resumeStoredPath) {
    return res.status(404).json({ error: 'Резюме не загружено' })
  }
  const abs = path.join(UPLOAD_ROOT, user.resumeStoredPath)
  if (!fs.existsSync(abs)) {
    return res.status(404).json({ error: 'Файл не найден' })
  }
  const name = user.resumeOriginalName || 'resume.pdf'
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`)
  return res.sendFile(path.resolve(abs))
})

router.delete('/resume', async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
  if (user.resumeStoredPath) {
    unlinkResumeFile(user.resumeStoredPath)
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      resumeStoredPath: null,
      resumeOriginalName: null,
      resumeUploadedAt: null,
    },
  })
  return res.json({ user: profileUser(updated) })
})

router.put('/password', async (req: AuthedRequest, res) => {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const { currentPassword, password } = parsed.data
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) {
    return res.status(400).json({ error: 'Неверный текущий пароль' })
  }
  const passwordPlain = password.trim()
  const passwordHash = await bcrypt.hash(passwordPlain, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })
  return res.json({ ok: true })
})

export default router
