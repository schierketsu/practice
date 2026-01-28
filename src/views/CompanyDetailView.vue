<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <div v-if="company" class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden relative">
      <button
        @click="$router.push('/практики')"
        class="absolute top-0 left-[-1px] w-[49px] h-16 sm:h-32 pl-3 pr-3 bg-[#A8E4A0] text-[#000000] border-none rounded-tl-lg font-bold cursor-pointer transition-colors flex items-center justify-center z-10 m-0 hover:bg-[#A8E4A0]"
        style="border-radius: 12px 0 0 0;"
      >
        <img src="/arrowleft.png" alt="←" class="w-auto h-auto max-w-[24px] max-h-[24px] block" />
      </button>
      <div class="absolute top-0 left-[48px] w-16 h-16 sm:w-32 sm:h-32 rounded-r-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 z-10">
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
      <div class="pt-4 pr-4 pb-[calc(2.5rem+1px)] sm:pt-5 sm:pr-6 sm:pb-[calc(3rem+1px)] lg:pt-7 lg:pr-8 lg:pb-[calc(3rem+1px)] pl-[calc(49px+64px+12px)] sm:pl-[calc(49px+128px+24px)]">
        <div class="flex justify-between items-start min-h-16 sm:min-h-32 mb-2 sm:mb-3">
          <div class="flex flex-col justify-start">
            <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight text-[#000000] dark:text-white">{{ company.name }}</h1>
            <p class="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-white leading-tight">
              {{ company.sector }}
            </p>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <a
              v-if="parsedContacts.email"
              :href="`mailto:${parsedContacts.email}`"
              class="px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <img :src="isDark ? '/iconemaildark.png' : '/iconemail.png'" alt="Email" class="w-4 h-4 sm:w-6 sm:h-6 object-contain" />
            </a>
            <a
              v-if="parsedContacts.phone"
              :href="`tel:${parsedContacts.phone.replace(/\s/g, '')}`"
              class="px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <svg class="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>
        </div>

        <div class="mb-4 sm:mb-6 -ml-[calc(64px+12px+24px)] sm:-ml-[calc(128px+24px)] pl-0 sm:pl-0 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div class="sm:w-3/5 lg:w-3/5">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">О компании</h2>
            <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">{{ company.description }}</p>
          </div>
          <div class="sm:w-2/5 lg:w-2/5 flex flex-col items-start sm:items-end flex-shrink-0">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-left sm:text-right">Здесь используют:</h2>
            <div class="grid grid-cols-2 gap-2 sm:gap-2.5 w-[200px] sm:w-[240px] flex-shrink-0 ml-0 sm:ml-auto">
              <div
                v-for="tech in company.technologies"
                :key="tech"
                class="aspect-square flex items-center justify-center p-2 sm:p-3 bg-white dark:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <img
                  :src="`/stack/${getTechSvgPath(tech)}`"
                  :alt="tech"
                  :class="[
                    'w-full h-full object-contain p-1',
                    tech === 'PHP' && isDark ? 'brightness-0 invert' : ''
                  ]"
                  @error="handleTechImageError"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      <div class="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700">
        <button
          class="w-full py-2.5 sm:py-3 bg-[#A8E4A0] text-[#000000] rounded-none hover:bg-[#A8E4A0] transition-colors font-semibold text-sm sm:text-base lg:text-lg"
        >
          подать заявку на практику
        </button>
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

// Маппинг названий технологий на пути к SVG файлам
function getTechSvgPath(tech) {
  const techMap = {
    'Vue': 'vue.svg',
    'React': 'reactquery.svg', // используем reactquery.svg, так как react.svg нет
    'TypeScript': 'typescript.svg',
    'Flutter': 'flutter.svg',
    'PHP': 'php.svg',
    'C#': 'csharp.svg',
    'C++': 'c-plusplus.svg',
    'Python': 'python.svg',
    'FastAPI': 'fastapi.svg',
    'Laravel': 'laravel.svg',
    'Kotlin': 'kotlin.svg',
    'Entity': 'csharp.svg', // используем csharp.svg для Entity
    'Битрикс': 'php.svg', // используем php.svg для Битрикс
    '1C CRM': 'csharp.svg', // используем csharp.svg для 1C CRM
    'JavaScript': 'javascript.svg',
    'CSS': 'css.svg',
    'Tailwind CSS': 'tailwindcss.svg',
    'Django': 'django.svg',
    'Dart': 'dart.svg',
    'PostgreSQL': 'postgresql.svg',
    'Angular': 'angular.svg',
    'C': 'c.svg'
  }
  
  return techMap[tech] || 'javascript.svg' // fallback на javascript.svg если технология не найдена
}

function handleTechImageError(event) {
  // Скрываем изображение при ошибке загрузки
  event.target.style.display = 'none'
}
</script>


