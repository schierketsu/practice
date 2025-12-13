<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button
      @click="$router.push('/')"
      class="mb-6 px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>Назад к списку</span>
    </button>

    <div v-if="company" class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-white">
      <div class="p-4 sm:p-8">
        <div class="flex items-center gap-4 sm:gap-6 mb-6">
          <div class="w-16 h-16 sm:w-24 sm:h-24 rounded-lg border border-gray-200 dark:border-none bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              :src="company.logo"
              :alt="company.name"
              @error="handleImageError"
              class="w-full h-full object-contain"
              :class="{ 'hidden': imageError }"
            />
            <div v-if="imageError" class="text-sm font-medium text-gray-500 dark:text-white text-center px-2">
              {{ getPlaceholderText(company.name) }}
            </div>
          </div>
          <div class="flex-1 flex flex-col justify-center min-h-16 sm:min-h-24">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight text-[#000000] dark:text-white">{{ company.name }}</h1>
            <p class="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-white leading-tight">
              {{ company.sector }}
            </p>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">О компании</h2>
          <p class="text-gray-700 dark:text-white leading-relaxed">{{ company.description }}</p>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Технологии</h2>
          <div class="flex flex-wrap gap-2">
            <TechnologyTag
              v-for="tech in company.technologies"
              :key="tech"
              :technology="tech"
            />
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Контакты</h2>
          <p class="text-gray-700 dark:text-white">{{ company.contacts }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-white text-lg">Компания не найдена</p>
      <button
        @click="$router.push('/')"
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
import TechnologyTag from '../components/TechnologyTag.vue'

const route = useRoute()
const store = useCompaniesStore()
const imageError = ref(false)

const company = computed(() => store.getCompanyById(route.params.id))

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

