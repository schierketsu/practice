import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../api/client'

/** Путь карточки компании: /компания/{slug} (fallback на id, если slug ещё нет) */
export function companyPagePath(company) {
  if (!company) return '/практики'
  const seg =
    company.slug != null && String(company.slug).trim() !== ''
      ? String(company.slug).trim()
      : company.id
  return `/компания/${encodeURIComponent(String(seg))}`
}

/** Список вузов компании (новое поле universities или legacy university) */
export function companyUniversitiesList(company) {
  const u = company?.universities
  if (Array.isArray(u) && u.length > 0) return u.filter(Boolean)
  if (company?.university) return [company.university]
  return []
}

export const useCompaniesStore = defineStore('companies', () => {
  const companies = ref([])
  const loadError = ref(null)
  const loaded = ref(false)
  const loading = ref(false)

  const selectedTechnologies = ref([])
  const searchQuery = ref('')
  const selectedCity = ref('')
  const selectedUniversity = ref('')
  const selectedFaculty = ref('')

  const technologyIconUrls = ref({})
  /** Справочник технологий с полем iconUrl (null — показываем серый квадрат) */
  const technologyCatalog = ref([])

  async function fetchTechnologyIcons() {
    try {
      const data = await apiFetch('/api/technologies', { skipAuth: true })
      const list = data.technologies || []
      technologyCatalog.value = list
      const o = {}
      for (const t of list) {
        if (t.iconUrl) o[t.name] = t.iconUrl
      }
      technologyIconUrls.value = o
    } catch {
      technologyCatalog.value = []
      technologyIconUrls.value = {}
    }
  }

  /** URL иконки или null (без подстановки /public/stack) */
  function techIconUrlFor(tech) {
    const u = technologyIconUrls.value[tech]
    if (u) return u
    const row = technologyCatalog.value.find((t) => t.name === tech)
    return row?.iconUrl ?? null
  }

  async function fetchCompanies() {
    loading.value = true
    loadError.value = null
    try {
      const data = await apiFetch('/api/companies', { skipAuth: true })
      companies.value = data.companies || []
      loaded.value = true
    } catch (e) {
      loadError.value = e.message || 'Не удалось загрузить компании'
      companies.value = []
    } finally {
      loading.value = false
    }
    await fetchTechnologyIcons()
  }

  const allTechnologies = computed(() => {
    if (technologyCatalog.value.length > 0) {
      return technologyCatalog.value.map((t) => t.name)
    }
    const techSet = new Set()
    companies.value.forEach((company) => {
      ;(company.technologies || []).forEach((tech) => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  })

  const filteredCompanies = computed(() => {
    let result = companies.value

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.description.toLowerCase().includes(query)
      )
    }

    if (selectedTechnologies.value.length > 0) {
      result = result.filter((company) =>
        selectedTechnologies.value.every((tech) => company.technologies.includes(tech))
      )
    }

    if (selectedCity.value) {
      result = result.filter((company) => company.city === selectedCity.value)
    }

    if (selectedUniversity.value) {
      result = result.filter((company) =>
        companyUniversitiesList(company).includes(selectedUniversity.value)
      )
    }

    if (selectedFaculty.value) {
      result = result.filter((company) => company.faculty === selectedFaculty.value)
    }

    return result
  })

  const cities = computed(() => {
    const citySet = new Set()
    companies.value.forEach((company) => {
      if (company.city) citySet.add(company.city)
    })
    return Array.from(citySet).sort()
  })

  const universities = computed(() => {
    const uniSet = new Set()
    companies.value.forEach((company) => {
      if (selectedCity.value && company.city !== selectedCity.value) return
      companyUniversitiesList(company).forEach((u) => uniSet.add(u))
    })
    return Array.from(uniSet).sort()
  })

  const faculties = computed(() => {
    if (!selectedUniversity.value) {
      const facSet = new Set()
      companies.value.forEach((company) => {
        if (company.faculty) facSet.add(company.faculty)
      })
      return Array.from(facSet).sort()
    }
    const facSet = new Set()
    companies.value.forEach((company) => {
      if (
        companyUniversitiesList(company).includes(selectedUniversity.value) &&
        company.faculty
      ) {
        facSet.add(company.faculty)
      }
    })
    return Array.from(facSet).sort()
  })

  function setTechnologiesFilter(technologies) {
    selectedTechnologies.value = technologies
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function setLocationFilters(city, university, faculty) {
    selectedCity.value = city || ''
    selectedUniversity.value = university || ''
    selectedFaculty.value = faculty || ''
  }

  /** Выбранная компания на мобильной карте (нижняя панель); сброс из dismiss / clearFilters */
  const mobileMapSelectedCompanyId = ref(null)

  function dismissMobileMapCompanyCard() {
    mobileMapSelectedCompanyId.value = null
  }

  function clearFilters() {
    selectedTechnologies.value = []
    searchQuery.value = ''
    selectedCity.value = ''
    selectedUniversity.value = ''
    selectedFaculty.value = ''
    dismissMobileMapCompanyCard()
  }

  function getCompanyById(id) {
    return companies.value.find((company) => company.id === parseInt(String(id), 10))
  }

  /** Сегмент из URL: slug или числовой id (старые ссылки) */
  function getCompanyByRouteSegment(segment) {
    if (segment == null || segment === '') return undefined
    const s = String(segment)
    const list = companies.value
    const bySlug = list.find((c) => c.slug === s)
    if (bySlug) return bySlug
    if (/^\d+$/.test(s)) {
      const id = parseInt(s, 10)
      return list.find((c) => c.id === id)
    }
    return undefined
  }

  return {
    companies,
    loadError,
    loaded,
    loading,
    fetchCompanies,
    selectedTechnologies,
    searchQuery,
    selectedCity,
    selectedUniversity,
    selectedFaculty,
    allTechnologies,
    filteredCompanies,
    cities,
    universities,
    faculties,
    setTechnologiesFilter,
    setSearchQuery,
    setLocationFilters,
    clearFilters,
    dismissMobileMapCompanyCard,
    mobileMapSelectedCompanyId,
    technologyIconUrls,
    technologyCatalog,
    fetchTechnologyIcons,
    techIconUrlFor,
    getCompanyById,
    getCompanyByRouteSegment,
  }
})
