import type { Request, Response, NextFunction } from 'express'
import type { User, Role } from '@prisma/client'
import { verifyToken } from '../lib/jwt.js'
import { prisma } from '../lib/prisma.js'

export type AuthedRequest = Request & { user?: User }

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' })
  }
  const token = header.slice(7)
  try {
    const { sub } = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: sub } })
    if (!user || user.blocked) {
      return res.status(401).json({ error: 'Недействительная сессия' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' })
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Нужны права администратора' })
  }
  next()
}
