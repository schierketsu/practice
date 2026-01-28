<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <div v-if="company" class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden relative">
      <button
        @click="$router.push('/практики')"
        class="absolute top-0 left-[-1px] w-[48px] h-20 sm:h-36 pl-3 pr-3 bg-[#A8E4A0] text-[#000000] border-none rounded-tl-lg font-bold cursor-pointer transition-colors flex items-center justify-center z-10 m-0 hover:bg-[#A8E4A0]"
        style="border-radius: 12px 0 0 0;"
      >
        <img src="/arrowleft.png" alt="←" class="w-auto h-auto max-w-[24px] max-h-[24px] block" />
      </button>
      <div class="absolute top-0 left-[47px] w-20 h-20 sm:w-36 sm:h-36 rounded-r-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 z-10">
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
      <div class="pt-4 pr-4 pb-[calc(2.5rem+1px)] sm:pt-5 sm:pr-6 sm:pb-[calc(3rem+1px)] lg:pt-7 lg:pr-8 lg:pb-[calc(3rem+1px)] pl-[calc(48px+80px+12px)] sm:pl-[calc(48px+144px+24px)]">
        <div class="flex flex-col justify-start min-h-20 sm:min-h-36 mb-2 sm:mb-3">
          <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight text-[#000000] dark:text-white" style="font-variant: small-caps;">{{ company.name }}</h1>
          <p class="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-white leading-tight" style="font-variant: small-caps;">
            {{ company.sector }}
          </p>
        </div>

        <div class="mb-4 sm:mb-6 -ml-[calc(48px+80px+12px)] sm:-ml-[calc(48px+144px+24px)] pl-[24px] sm:pl-[48px] flex flex-col gap-4 sm:gap-6">
          <div class="w-full">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3" style="font-variant: small-caps;">О КОМПАНИИ</h2>
            <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">{{ company.description }}</p>
          </div>
          <div class="w-full -mr-4 sm:-mr-6 lg:-mr-8">
            <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5 w-full justify-items-stretch">
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

    <!-- Окно с отзывами -->
    <div v-if="company" class="mt-4 sm:mt-6 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden">
      <div class="pt-4 pr-4 pb-4 sm:pt-6 sm:pr-6 sm:pb-6 lg:pt-8 lg:pr-8 lg:pb-8 pl-4 sm:pl-6 lg:pl-8">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6" style="font-variant: small-caps;">ОТКЛИКИ</h2>
        <div class="space-y-4 sm:space-y-6">
          <div
            v-for="(review, index) in reviews"
            :key="index"
            class="p-4 sm:p-6 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg"
          >
            <div class="flex items-start gap-3 sm:gap-4 mb-3">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span class="text-lg sm:text-xl font-bold text-gray-600 dark:text-white">
                  {{ review.author.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {{ review.author }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {{ review.date }}
                </p>
              </div>
            </div>
            <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
              {{ review.text }}
            </p>
          </div>
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

const route = useRoute()
const store = useCompaniesStore()
const themeStore = useThemeStore()
const imageError = ref(false)

const isDark = computed(() => themeStore.isDark)

const company = computed(() => store.getCompanyById(route.params.id))

// Примерные отзывы (в реальном приложении это должно приходить из store или API)
const reviews = computed(() => {
  if (!company.value) return []
  
  // Примерные отзывы для разных компаний
  const reviewsMap = {
    1: [
      {
        author: 'Алексей Петров',
        date: 'лето 2025',
        text: 'Отличная практика! Научился работать с Vue и PHP на реальных проектах. Команда очень дружелюбная, всегда помогут разобраться. Рекомендую!'
      },
      {
        author: 'Мария Иванова',
        date: 'зима 2026',
        text: 'Практика превзошла все ожидания. Получил много практического опыта, работал над интересными задачами. Особенно понравилось работать с Flutter.'
      }
    ],
    2: [
      {
        author: 'Дмитрий Сидоров',
        date: 'осень 2025',
        text: 'Интересная практика по микроконтроллерам. Узнал много нового про C++ и Python. Работа с железом - это совсем другой уровень программирования!'
      },
      {
        author: 'Елена Козлова',
        date: 'весна 2026',
        text: 'Отличный опыт работы с FastAPI. Команда профессионалов, всегда готовы помочь. Получил ценные знания, которые пригодятся в будущем.'
      }
    ],
    3: [
      {
        author: 'Иван Смирнов',
        date: 'лето 2025',
        text: 'Практика в F5 - это отличная возможность поработать с enterprise-технологиями. Laravel, Kotlin, Flutter - все на реальных проектах. Очень доволен!'
      },
      {
        author: 'Анна Волкова',
        date: 'зима 2026',
        text: 'Отличная команда и интересные задачи. Научилась работать с 1C CRM и мобильной разработкой. Практика дала много практических навыков.'
      }
    ],
    4: [
      {
        author: 'Сергей Новиков',
        date: 'осень 2025',
        text: 'Практика по информационной безопасности очень интересная. Работал с React, Python и C#. Узнал много про безопасность данных и защиту систем.'
      },
      {
        author: 'Ольга Морозова',
        date: 'весна 2026',
        text: 'Отличный опыт! Команда профессионалов, интересные проекты. Особенно понравилось работать с Entity Framework и базами данных.'
      }
    ]
  }
  
  return reviewsMap[company.value.id] || []
})

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


