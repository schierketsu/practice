/** Подставляем реальное имя вуза, если в JSON попал литерал из-за json_array("university") в SQLite. */
const CHUVSU = 'ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'

export function parseUniversities(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    const list = raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    if (list.length === 1 && list[0].trim().toLowerCase() === 'university') {
      return [CHUVSU]
    }
    return list
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return []
    try {
      const parsed: unknown = JSON.parse(t)
      if (Array.isArray(parsed)) return parseUniversities(parsed)
    } catch {
      /* not JSON */
    }
    return [t]
  }
  return []
}

export function mapCompany(c: {
  id: number
  name: string
  logo: string
  description: string
  technologies: unknown
  sector: string
  contacts: string
  city: string
  universities: unknown
  faculty: string
  lat: number
  lng: number
}) {
  const universities = parseUniversities(c.universities)
  return {
    id: c.id,
    name: c.name,
    logo: c.logo,
    description: c.description,
    technologies: c.technologies as string[],
    sector: c.sector,
    contacts: c.contacts,
    city: c.city,
    universities,
    faculty: c.faculty,
    coordinates: { lat: c.lat, lng: c.lng },
  }
}
