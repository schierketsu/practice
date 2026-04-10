import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import { registerSchema, loginSchema } from '../lib/validation.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function publicUser(u: { id: string; email: string; role: string }) {
  return { id: u.id, email: u.email, role: u.role }
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const { email, password } = parsed.data
  const passwordPlain = password.trim()
  if (password !== password.trim()) {
    return res.status(400).json({ error: 'Уберите пробелы в начале и конце пароля' })
  }
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return res.status(409).json({ error: 'Email уже зарегистрирован' })
  }
  const passwordHash = await bcrypt.hash(passwordPlain, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash, role: 'USER' },
  })
  const token = signToken(user.id, user.role)
  return res.status(201).json({ token, user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.blocked) {
    return res.status(401).json({ error: 'Неверный email или пароль' })
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ error: 'Неверный email или пароль' })
  }
  const token = signToken(user.id, user.role)
  return res.json({ token, user: publicUser(user) })
})

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const u = req.user!
  return res.json({ user: publicUser(u) })
})

export default router
