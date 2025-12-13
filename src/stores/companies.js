import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCompaniesStore = defineStore('companies', () => {
  const companies = ref([
    {
      id: 1,
      name: 'Бокус',
      logo: '/bokus.jpg',
      description: 'Российская IT-компания, специализирующаяся на разработке корпоративного программного обеспечения и веб-приложений. Предлагаем практику для студентов с возможностью работы над реальными проектами для крупных клиентов. Студенты получат опыт работы с современными технологиями разработки и командной работы.',
      technologies: ['Java', 'Spring Boot', 'Vue.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'Git'],
      sector: 'Автоматизация бизнеса',
      contacts: 'hr@bocus.ru, +7 (495) 123-45-67'
    },
    {
      id: 2,
      name: 'Экра',
      logo: '/ekra.jpg',
      description: 'Компания занимается разработкой систем автоматизации и управления для промышленности. Практика включает работу с промышленными системами, SCADA, IoT решениями и интеграцией оборудования. Студенты изучат работу с реальными промышленными системами и современными подходами к автоматизации.',
      technologies: ['C#', '.NET', 'Python', 'SQL Server', 'MQTT', 'OPC UA', 'Docker'],
      sector: 'Микроконтролллеры',
      contacts: 'practice@ekra.ru, +7 (812) 234-56-78'
    },
    {
      id: 3,
      name: 'F5',
      logo: '/f5.jpg',
      description: 'F5 Networks - ведущая компания в области сетевых технологий, балансировки нагрузки и безопасности приложений. Практика включает работу с решениями BIG-IP, NGINX, облачными сервисами и автоматизацией сетевой инфраструктуры. Студенты получат опыт работы с enterprise-решениями и современными подходами к безопасности приложений.',
      technologies: ['Python', 'NGINX', 'BIG-IP', 'Kubernetes', 'Terraform', 'Ansible', 'REST API', 'Linux'],
      sector: 'Автоматизация бизнеса',
      contacts: 'careers@f5.com, +7 (495) 345-67-89'
    },
    {
      id: 4,
      name: 'Кейсистемс',
      logo: '/keysystems.png',
      description: 'Российская компания, специализирующаяся на разработке систем управления базами данных, аналитики и бизнес-приложений. Практика включает работу с большими данными, аналитическими системами и разработку корпоративных решений. Студенты изучат современные подходы к работе с данными и разработке масштабируемых систем.',
      technologies: ['Python', 'PostgreSQL', 'ClickHouse', 'Apache Kafka', 'Docker', 'Kubernetes', 'React', 'TypeScript'],
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

