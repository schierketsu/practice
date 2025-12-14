<template>
  <div class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <button
      @click="$router.push('/практики')"
      class="mb-4 sm:mb-6 px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-xs sm:text-base"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>Назад к списку</span>
    </button>

    <div v-if="company" class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-white">
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div class="w-14 h-14 sm:w-24 sm:h-24 rounded-lg border border-gray-200 dark:border-none bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              :src="company.logo"
              :alt="company.name"
              @error="handleImageError"
              class="w-full h-full object-contain"
              :class="{ 'hidden': imageError }"
            />
            <div v-if="imageError" class="text-xs sm:text-sm font-medium text-gray-500 dark:text-white text-center px-2">
              {{ getPlaceholderText(company.name) }}
            </div>
          </div>
          <div class="flex-1 flex flex-col justify-center min-h-14 sm:min-h-24">
            <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight text-[#000000] dark:text-white">{{ company.name }}</h1>
            <p class="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-white leading-tight">
              {{ company.sector }}
            </p>
          </div>
        </div>

        <div class="mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">О компании</h2>
          <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">{{ company.description }}</p>
        </div>

        <div class="mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Технологии</h2>
          <div class="flex flex-wrap gap-2">
            <TechnologyTag
              v-for="tech in company.technologies"
              :key="tech"
              :technology="tech"
              :is-selected="store.selectedTechnologies.includes(tech)"
            />
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Контакты</h2>
          <div class="flex flex-col sm:flex-row gap-3">
            <a
              v-if="parsedContacts.email"
              :href="`mailto:${parsedContacts.email}`"
              class="flex-1 px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-xs sm:text-base break-all"
            >
              <img :src="isDark ? '/iconemaildark.png' : '/iconemail.png'" alt="Email" class="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
              <span class="truncate">{{ parsedContacts.email }}</span>
            </a>
            <a
              v-if="parsedContacts.phone"
              :href="`tel:${parsedContacts.phone.replace(/\s/g, '')}`"
              class="flex-1 px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-xs sm:text-base"
            >
              <svg class="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="truncate">{{ parsedContacts.phone }}</span>
            </a>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
          <button
            class="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-[#57D900] text-[#000000] rounded-lg hover:bg-[#4ac000] transition-colors font-semibold text-sm sm:text-base lg:text-lg"
          >
            подать заявку на практику
          </button>
        </div>
      </div>
    </div>

    <div v-if="!company" class="text-center py-12">
      <p class="text-gray-500 dark:text-white text-lg">Компания не найдена</p>
      <button
        @click="$router.push('/практики')"
        class="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        Вернуться к списку
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'
import TechnologyTag from '../components/TechnologyTag.vue'

const route = useRoute()
const store = useCompaniesStore()
const themeStore = useThemeStore()
const imageError = ref(false)

const isDark = computed(() => themeStore.isDark)

const company = computed(() => store.getCompanyById(route.params.id))

const parsedContacts = computed(() => {
  if (!company.value) return { email: null, phone: null }
  
  const contacts = company.value.contacts
  const emailMatch = contacts.match(/[\w\.-]+@[\w\.-]+\.\w+/)
  const phoneMatch = contacts.match(/\+?\d[\d\s()-]{7,}/)
  
  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null
  }
})

function handleImageError(event) {
  imageError.value = true
}

function getPlaceholderText(name) {
  if (name.length <= 3) {
    return name
  }
  return name.charAt(0).toUpperCase()
}
</script>


