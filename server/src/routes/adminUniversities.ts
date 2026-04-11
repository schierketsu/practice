import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { parseUniversities } from '../lib/mapCompany.js'

const router = Router()

const universityBody = z.object({ name: z.string().trim().min(1).max(300) })
const facultyBody = z.object({ name: z.string().trim().min(1).max(300) })

export async function assertCompanyUniversitiesAndFaculty(
  universities: string[],
  faculty: string,
): Promise<string | null> {
  const rows = await prisma.university.findMany({
    where: { name: { in: universities } },
    include: { faculties: true },
  })
  if (rows.length !== universities.length) {
    return 'Укажите только вузы из справочника (вкладка «Вузы»)'
  }
  const ok = rows.some((u) => u.faculties.some((f) => f.name === faculty))
  if (!ok) {
    if (rows.every((u) => u.faculties.length === 0)) {
      return 'У выбранных вузов нет факультетов — добавьте их во вкладке «Вузы»'
    }
    return 'Выберите факультет из списка одного из выбранных вузов'
  }
  return null
}

async function universityUsedInCompanies(name: string): Promise<boolean> {
  const all = await prisma.company.findMany({ select: { universities: true } })
  return all.some((c) => parseUniversities(c.universities).includes(name))
}

async function facultyUsedInCompanies(universityName: string, facultyName: string): Promise<boolean> {
  const all = await prisma.company.findMany({ select: { universities: true, faculty: true } })
  return all.some(
    (c) =>
      parseUniversities(c.universities).includes(universityName) && c.faculty === facultyName,
  )
}

router.get('/universities', async (_req, res) => {
  const list = await prisma.university.findMany({
    orderBy: { name: 'asc' },
    include: { faculties: { orderBy: { name: 'asc' } } },
  })
  return res.json({
    universities: list.map((u) => ({
      id: u.id,
      name: u.name,
      faculties: u.faculties.map((f) => ({ id: f.id, name: f.name })),
    })),
  })
})

router.post('/universities', async (req, res) => {
  const parsed = universityBody.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  try {
    const u = await prisma.university.create({ data: { name: parsed.data.name } })
    return res.status(201).json({ university: { id: u.id, name: u.name, faculties: [] } })
  } catch {
    return res.status(409).json({ error: 'Вуз с таким названием уже есть' })
  }
})

router.patch('/universities/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const parsed = universityBody.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const prev = await prisma.university.findUnique({ where: { id } })
  if (!prev) return res.status(404).json({ error: 'Не найдено' })
  const nextName = parsed.data.name
  if (prev.name === nextName) {
    const u = await prisma.university.findUniqueOrThrow({
      where: { id },
      include: { faculties: { orderBy: { name: 'asc' } } },
    })
    return res.json({
      university: {
        id: u.id,
        name: u.name,
        faculties: u.faculties.map((f) => ({ id: f.id, name: f.name })),
      },
    })
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.university.update({ where: { id }, data: { name: nextName } })
      const companies = await tx.company.findMany()
      for (const c of companies) {
        const arr = parseUniversities(c.universities)
        if (!arr.includes(prev.name)) continue
        const nextArr = arr.map((x) => (x === prev.name ? nextName : x))
        await tx.company.update({
          where: { id: c.id },
          data: { universities: nextArr },
        })
      }
    })
  } catch {
    return res.status(409).json({ error: 'Не удалось сохранить (возможно, дубликат названия)' })
  }
  const u = await prisma.university.findUniqueOrThrow({
    where: { id },
    include: { faculties: { orderBy: { name: 'asc' } } },
  })
  return res.json({
    university: {
      id: u.id,
      name: u.name,
      faculties: u.faculties.map((f) => ({ id: f.id, name: f.name })),
    },
  })
})

router.delete('/universities/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const u = await prisma.university.findUnique({ where: { id } })
  if (!u) return res.status(404).json({ error: 'Не найдено' })
  if (await universityUsedInCompanies(u.name)) {
    return res.status(409).json({ error: 'Вуз указан у компаний — сначала измените или удалите компании' })
  }
  await prisma.university.delete({ where: { id } })
  return res.json({ ok: true })
})

router.post('/universities/:id/faculties', async (req, res) => {
  const universityId = parseInt(String(req.params.id), 10)
  if (Number.isNaN(universityId)) return res.status(400).json({ error: 'Некорректный id' })
  const parsed = facultyBody.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const uni = await prisma.university.findUnique({ where: { id: universityId } })
  if (!uni) return res.status(404).json({ error: 'Вуз не найден' })
  try {
    const f = await prisma.faculty.create({
      data: { universityId, name: parsed.data.name },
    })
    return res.status(201).json({ faculty: { id: f.id, name: f.name, universityId } })
  } catch {
    return res.status(409).json({ error: 'Такой факультет у этого вуза уже есть' })
  }
})

router.patch('/faculties/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const parsed = facultyBody.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() })
  }
  const prev = await prisma.faculty.findUnique({ where: { id }, include: { university: true } })
  if (!prev) return res.status(404).json({ error: 'Не найдено' })
  const uniName = prev.university.name
  const nextName = parsed.data.name
  if (prev.name === nextName) {
    return res.json({ faculty: { id: prev.id, name: prev.name, universityId: prev.universityId } })
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.faculty.update({ where: { id }, data: { name: nextName } })
      const companies = await tx.company.findMany()
      for (const c of companies) {
        if (c.faculty !== prev.name) continue
        if (!parseUniversities(c.universities).includes(uniName)) continue
        await tx.company.update({ where: { id: c.id }, data: { faculty: nextName } })
      }
    })
  } catch {
    return res.status(409).json({ error: 'Не удалось сохранить (возможно, дубликат)' })
  }
  return res.json({ faculty: { id, name: nextName, universityId: prev.universityId } })
})

router.delete('/faculties/:id', async (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Некорректный id' })
  const f = await prisma.faculty.findUnique({ where: { id }, include: { university: true } })
  if (!f) return res.status(404).json({ error: 'Не найдено' })
  if (await facultyUsedInCompanies(f.university.name, f.name)) {
    return res.status(409).json({ error: 'Факультет указан у компаний — сначала измените компании' })
  }
  await prisma.faculty.delete({ where: { id } })
  return res.json({ ok: true })
})

export default router
