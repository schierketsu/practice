import { prisma } from './prisma.js'

export function toUploadsUrl(iconPath: string): string {
  const rel = iconPath.replace(/\\/g, '/').replace(/^uploads\/?/, '').replace(/^\/+/, '')
  return rel.startsWith('uploads/') ? `/${rel}` : `/uploads/${rel}`
}

export async function assertTechnologiesInCatalog(names: string[]): Promise<string | null> {
  const uniq = [...new Set(names)]
  const rows = await prisma.technologyIcon.findMany({ where: { name: { in: uniq } } })
  if (rows.length !== uniq.length) {
    return 'Укажите только технологии из справочника (вкладка «Технологии»)'
  }
  return null
}

export async function technologyUsedInCompanies(name: string): Promise<boolean> {
  const comps = await prisma.company.findMany({ select: { technologies: true } })
  for (const c of comps) {
    const arr = c.technologies as unknown
    if (Array.isArray(arr) && arr.includes(name)) return true
  }
  return false
}
