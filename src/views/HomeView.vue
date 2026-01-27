<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
    <div class="h-[calc(100vh-200px)] min-h-[600px] relative">
      <div v-if="store.companies.length === 0" class="absolute inset-0 flex items-center justify-center z-10">
        <p class="text-gray-500 dark:text-white text-base sm:text-lg">Загрузка...</p>
      </div>
      <div v-else-if="filteredCompanies.length === 0" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#F9FAFB] dark:bg-[#000000] bg-opacity-90 dark:bg-opacity-90">
        <p class="text-gray-500 dark:text-white text-base sm:text-lg mb-4">Организации не найдены</p>
        <button
          @click="clearFilters"
          class="px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-xs sm:text-base"
        >
          Сбросить фильтры
        </button>
      </div>
      <div v-else class="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full">
        <!-- Фильтры слева (1/3 ширины) -->
        <div class="w-full lg:w-1/3 flex-shrink-0 overflow-y-auto">
          <LocationFilters />
        </div>

        <!-- Карта справа (2/3 ширины) -->
        <div class="w-full lg:w-2/3 flex-shrink-0 h-full">
          <OrganizationMap />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCompaniesStore } from '../stores/companies'
import LocationFilters from '../components/LocationFilters.vue'
import OrganizationMap from '../components/OrganizationMap.vue'

const store = useCompaniesStore()

onMounted(() => {
  if (store.companies.length === 0) {
    console.error('Companies store is empty')
  }
})

const filteredCompanies = computed(() => {
  return store.filteredCompanies
})

function clearFilters() {
  store.clearFilters()
}
</script>

