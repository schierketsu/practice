<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <div v-if="company" class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden relative">
      <button
        @click="$router.push('/практики')"
        class="absolute top-0 left-[-1px] w-[36px] sm:w-[48px] h-20 sm:h-36 pl-2 pr-2 sm:pl-3 sm:pr-3 bg-[#A8E4A0] text-[#000000] border-none rounded-tl-lg font-bold cursor-pointer transition-colors flex items-center justify-center z-10 m-0 hover:bg-[#A8E4A0]"
        style="border-radius: 12px 0 0 0;"
      >
        <img src="/arrowleft.png" alt="←" class="w-auto h-auto max-w-[20px] max-h-[20px] sm:max-w-[24px] sm:max-h-[24px] block" />
      </button>
      <div class="absolute top-0 left-[35px] sm:left-[47px] w-20 h-20 sm:w-36 sm:h-36 rounded-r-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 z-10">
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
      <div class="pt-4 pr-4 pb-0 sm:pt-5 sm:pr-6 sm:pb-0 lg:pt-7 lg:pr-8 lg:pb-0 pl-[calc(36px+80px+12px)] sm:pl-[calc(48px+144px+24px)]">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between min-h-20 sm:min-h-36 mb-2 sm:mb-3">
          <div class="flex flex-col justify-start">
            <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight text-[#000000] dark:text-white" style="font-variant: small-caps;">{{ company.name }}</h1>
            <p class="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-white leading-tight">
              {{ company.sector }}
            </p>
          </div>
          <!-- Технологии для десктопа - правый верхний угол -->
          <div class="hidden lg:flex lg:flex-wrap lg:gap-2.5 lg:max-w-md lg:justify-end mt-0">
            <div
              v-for="tech in company.technologies"
              :key="tech"
              class="w-16 h-16 flex items-center justify-center p-2.5 bg-white dark:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <img
                :src="`/stack/${getTechSvgPath(tech)}`"
                :alt="tech"
                :class="[
                  'w-full h-full object-contain',
                  tech === 'PHP' && isDark ? 'brightness-0 invert' : ''
                ]"
                @error="handleTechImageError"
              />
            </div>
          </div>
        </div>

      </div>
      
      <!-- Секция "О КОМПАНИИ" -->
      <div class="-mt-2 sm:-mt-3 lg:-mt-4 pt-0 pr-4 pb-4 sm:pt-1 sm:pr-6 sm:pb-6 lg:pt-2 lg:pr-8 lg:pb-8 pl-4 sm:pl-6 lg:pl-8 flex flex-col gap-4 sm:gap-6">
        <div class="w-full">
          <h2 class="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white mb-2 sm:mb-3" style="font-variant: small-caps;">О КОМПАНИИ</h2>
          <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">{{ company.description }}</p>
        </div>
        <!-- Технологии для мобильной версии - остаются на месте -->
        <div class="w-full lg:hidden">
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-2.5 w-full justify-items-stretch">
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
      
      <!-- Карусель фотографий -->
      <div class="w-full">
        <div class="relative w-full overflow-hidden">
          <div 
            class="flex transition-transform duration-300 ease-in-out"
            :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
          >
            <div
              v-for="(image, index) in companyImages"
              :key="index"
              class="min-w-full h-64 sm:h-80 lg:h-96 flex-shrink-0"
            >
              <img
                :src="image"
                :alt="`${company.name} - фото ${index + 1}`"
                class="w-full h-full object-cover"
                @error="handleCarouselImageError"
              />
            </div>
          </div>
          
          <!-- Навигационные стрелки -->
          <button
            v-if="companyImages.length > 1"
            @click="previousImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Предыдущее фото"
          >
            <img src="/arrowleft.png" alt="←" class="w-4 h-4 brightness-0 invert" />
          </button>
          <button
            v-if="companyImages.length > 1"
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Следующее фото"
          >
            <img src="/arrowright.png" alt="→" class="w-4 h-4 brightness-0 invert" />
          </button>
          
          <!-- Индикаторы точек -->
          <div
            v-if="companyImages.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
          >
            <button
              v-for="(image, index) in companyImages"
              :key="index"
              @click="currentImageIndex = index"
              class="w-2 h-2 rounded-full transition-all"
              :class="currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'"
              :aria-label="`Перейти к фото ${index + 1}`"
            />
          </div>
        </div>
      </div>
      
      <!-- Кнопка подачи заявки -->
      <button
        class="w-full py-2.5 sm:py-3 bg-[#A8E4A0] text-[#000000] rounded-none hover:bg-[#A8E4A0] transition-colors font-semibold text-sm sm:text-base lg:text-lg"
      >
        подать заявку на практику
      </button>
    </div>

    <!-- Окно с отзывами -->
    <div v-if="company" class="mt-4 sm:mt-6 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden">
      <div class="pt-4 pr-4 pb-4 sm:pt-6 sm:pr-6 sm:pb-6 lg:pt-8 lg:pr-8 lg:pb-8 pl-4 sm:pl-6 lg:pl-8">
        <h2 class="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6" style="font-variant: small-caps;">ОТКЛИКИ</h2>
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
            <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed mb-3">
              {{ review.text }}
            </p>
            <div class="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span class="flex items-center gap-1 text-sm sm:text-base">
                {{ review.rating }}
                <svg class="w-[1em] h-[1em]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbd16a"/>
                </svg>
              </span>
              <span>{{ review.employment }}</span>
              <span>{{ review.location }}</span>
            </div>
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'

const route = useRoute()
const store = useCompaniesStore()
const themeStore = useThemeStore()
const imageError = ref(false)
const currentImageIndex = ref(0)

const isDark = computed(() => themeStore.isDark)

const company = computed(() => store.getCompanyById(route.params.id))

// Сброс индекса карусели при смене компании
watch(() => company.value?.id, () => {
  currentImageIndex.value = 0
})

// Фотографии для карусели
const companyImages = computed(() => {
  if (!company.value) return []
  
  // По умолчанию 3 изображения placeholder для всех компаний
  return ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg']
})

function nextImage() {
  if (currentImageIndex.value < companyImages.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = companyImages.value.length - 1
  }
}

function handleCarouselImageError(event) {
  // Заменяем на заглушку при ошибке загрузки
  event.target.src = '/bokus.jpg'
}

// Примерные отзывы (в реальном приложении это должно приходить из store или API)
const reviews = computed(() => {
  if (!company.value) return []
  
  // Примерные отзывы для разных компаний
  const reviewsMap = {
    1: [
      {
        author: 'Алексей Петров',
        date: 'лето 2025',
        text: 'Отличная практика! Научился работать с Vue и PHP на реальных проектах. Команда очень дружелюбная, всегда помогут разобраться. Рекомендую!',
        rating: 5,
        employment: 'Трудоустройство не предложили',
        location: 'Проходил удаленно'
      },
      {
        author: 'Мария Иванова',
        date: 'зима 2026',
        text: 'Практика превзошла все ожидания. Получил много практического опыта, работал над интересными задачами. Особенно понравилось работать с Flutter.',
        rating: 4,
        employment: 'Трудоустройство предложили',
        location: 'Проходил в офисе'
      }
    ],
    2: [
      {
        author: 'Дмитрий Сидоров',
        date: 'осень 2025',
        text: 'Интересная практика по микроконтроллерам. Узнал много нового про C++ и Python. Работа с железом - это совсем другой уровень программирования!',
        rating: 5,
        employment: 'Трудоустройство не предложили',
        location: 'Проходил в офисе'
      },
      {
        author: 'Елена Козлова',
        date: 'весна 2026',
        text: 'Отличный опыт работы с FastAPI. Команда профессионалов, всегда готовы помочь. Получил ценные знания, которые пригодятся в будущем.',
        rating: 4,
        employment: 'Трудоустройство предложили',
        location: 'Проходил удаленно'
      }
    ],
    3: [
      {
        author: 'Иван Смирнов',
        date: 'лето 2025',
        text: 'Практика в F5 - это отличная возможность поработать с enterprise-технологиями. Laravel, Kotlin, Flutter - все на реальных проектах. Очень доволен!',
        rating: 5,
        employment: 'Трудоустройство не предложили',
        location: 'Проходил удаленно'
      },
      {
        author: 'Анна Волкова',
        date: 'зима 2026',
        text: 'Отличная команда и интересные задачи. Научилась работать с 1C CRM и мобильной разработкой. Практика дала много практических навыков.',
        rating: 4,
        employment: 'Трудоустройство предложили',
        location: 'Проходил в офисе'
      }
    ],
    4: [
      {
        author: 'Сергей Новиков',
        date: 'осень 2025',
        text: 'Практика по информационной безопасности очень интересная. Работал с React, Python и C#. Узнал много про безопасность данных и защиту систем.',
        rating: 5,
        employment: 'Трудоустройство не предложили',
        location: 'Проходил в офисе'
      },
      {
        author: 'Ольга Морозова',
        date: 'весна 2026',
        text: 'Отличный опыт! Команда профессионалов, интересные проекты. Особенно понравилось работать с Entity Framework и базами данных.',
        rating: 4,
        employment: 'Трудоустройство предложили',
        location: 'Проходил удаленно'
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


