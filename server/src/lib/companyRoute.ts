import { prisma } from './prisma.js'

/** Публичная карточка: сначала точное совпадение slug, иначе — числовой id (старые ссылки). */
export async function findCompanyByRouteSegment(segment: string) {
  const s = String(segment ?? '').trim()
  if (!s) return null
  const bySlug = await prisma.company.findUnique({ where: { slug: s } })
  if (bySlug) return bySlug
  if (/^\d+$/.test(s)) {
    const id = parseInt(s, 10)
    if (!Number.isNaN(id)) return prisma.company.findUnique({ where: { id } })
  }
  return null
}
