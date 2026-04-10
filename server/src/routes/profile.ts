import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { changePasswordSchema } from '../lib/validation.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req: AuthedRequest, res) => {
  const u = req.user!
  return res.json({
    user: { id: u.id, email: u.email, role: u.role, createdAt: u.createdAt },
  })
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
