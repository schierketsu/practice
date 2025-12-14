import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCompaniesStore = defineStore('companies', () => {
  const companies = ref([
    {
      id: 1,
      name: 'Бокус',
      logo: '/bokus.jpg',
      description: 'Нравится делать веб приложения, которые реально используют тысячи людей? Мы покажем тебе, как создавать современные сайты на PHP и Vue, делать мобильные приложения на Flutter и работать с Битрикс. Здесь ты будешь работать над настоящими проектами для крупных клиентов, а не на учебных задачах. Приходи, стань частью команды.',
      technologies: ['PHP', 'TypeScript', 'Vue', 'Flutter', 'Битрикс'],
      sector: 'Автоматизация бизнеса',
      contacts: 'hr@bocus.ru, +7 (495) 123-45-67'
    },
    {
      id: 2,
      name: 'Экра',
      logo: '/ekra.jpg',
      description: 'Нравится программировать чипы и работать с железом? Мы покажем тебе, как писать на C++ для микроконтроллеров, создавать API на FastAPI и Python, делать системы управления оборудованием. Здесь ты сможешь прикоснуться к реальным промышленным проектам и понять, как код управляет физическим миром. Присоединяйся, будет интересно.',
      technologies: ['C#', 'C++', 'Python', 'FastAPI', 'TypeScript'],
      sector: 'Микроконтролллеры',
      contacts: 'practice@ekra.ru, +7 (812) 234-56-78'
    },
    {
      id: 3,
      name: 'F5',
      logo: '/f5.jpg',
      description: 'Хочешь делать приложения, которые работают без сбоев для миллионов пользователей? Мы покажем тебе Laravel для бэкенда, Kotlin и Flutter для мобилок, 1C CRM для бизнеса. Здесь ты узнаешь, как строить надежные системы, которые не падают под нагрузкой. Приходи, научим делать продукты уровня enterprise.',
      technologies: ['Laravel', '1C CRM', 'Kotlin', 'Flutter'],
      sector: 'Автоматизация бизнеса',
      contacts: 'careers@f5.com, +7 (495) 345-67-89'
    },
    {
      id: 4,
      name: 'Кейсистемс',
      logo: '/keysystems.png',
      description: 'Интересует информационная безопасность и защита данных? Мы покажем тебе React для фронтенда, Python и C# для бэкенда, Entity Framework для работы с базами. Здесь ты научишься строить безопасные системы, которые защищают данные пользователей. Приходи, стань тем, кто защищает цифровой мир.',
      technologies: ['React', 'Python', 'TypeScript', 'C#', 'Entity'],
      sector: 'Информационная безопасность',
      contacts: 'hr@keysystems.ru, +7 (495) 567-89-01'
    }
  ])

  const selectedTechnologies = ref([])
  const searchQuery = ref('')

  const allTechnologies = computed(() => {
    const techSet = new Set()
    companies.value.forEach(company => {
      company.technologies.forEach(tech => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  })

  const filteredCompanies = computed(() => {
    let result = companies.value

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(company => 
        company.name.toLowerCase().includes(query) ||
        company.description.toLowerCase().includes(query)
      )
    }

    if (selectedTechnologies.value.length > 0) {
      result = result.filter(company =>
        selectedTechnologies.value.every(tech =>
          company.technologies.includes(tech)
        )
      )
    }

    return result
  })

  function setTechnologiesFilter(technologies) {
    selectedTechnologies.value = technologies
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function clearFilters() {
    selectedTechnologies.value = []
    searchQuery.value = ''
  }

  function getCompanyById(id) {
    return companies.value.find(company => company.id === parseInt(id))
  }

  return {
    companies,
    selectedTechnologies,
    searchQuery,
    allTechnologies,
    filteredCompanies,
    setTechnologiesFilter,
    setSearchQuery,
    clearFilters,
    getCompanyById
  }
})

