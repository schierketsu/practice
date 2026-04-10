import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../api/client'

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
  }

  const allTechnologies = computed(() => {
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
      result = result.filter((company) => company.university === selectedUniversity.value)
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
    if (!selectedCity.value) {
      const uniSet = new Set()
      companies.value.forEach((company) => {
        if (company.university) uniSet.add(company.university)
      })
      return Array.from(uniSet).sort()
    }
    const uniSet = new Set()
    companies.value.forEach((company) => {
      if (company.city === selectedCity.value && company.university) {
        uniSet.add(company.university)
      }
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
      if (company.university === selectedUniversity.value && company.faculty) {
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
    getCompanyById,
  }
})
