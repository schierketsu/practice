import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-change-me'

export type JwtPayload = { sub: string; role: Role }

export function signToken(userId: string, role: Role) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
  return decoded
}
