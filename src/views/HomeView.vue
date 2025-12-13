<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <div class="mb-6 sm:mb-8">
      <div class="mb-4 sm:mb-6">
        <SearchInput v-model="searchQuery" />
      </div>
      
      <FilterBar />
    </div>

    <div v-if="store.companies.length === 0" class="text-center py-8 sm:py-12">
      <p class="text-gray-500 dark:text-white text-base sm:text-lg">Загрузка...</p>
    </div>
    <div v-else-if="filteredCompanies.length === 0" class="text-center py-8 sm:py-12">
      <p class="text-gray-500 dark:text-white text-base sm:text-lg">Компании не найдены</p>
      <button
        @click="clearFilters"
        class="mt-4 px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-xs sm:text-base"
      >
        Сбросить фильтры
      </button>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <CompanyCard
        v-for="company in filteredCompanies"
        :key="company.id"
        :company="company"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCompaniesStore } from '../stores/companies'
import CompanyCard from '../components/CompanyCard.vue'
import SearchInput from '../components/SearchInput.vue'
import FilterBar from '../components/FilterBar.vue'

const store = useCompaniesStore()

onMounted(() => {
  if (store.companies.length === 0) {
    console.error('Companies store is empty')
  }
})

const searchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => store.setSearchQuery(value)
})

const filteredCompanies = computed(() => {
  return store.filteredCompanies
})

function clearFilters() {
  store.clearFilters()
}
</script>

