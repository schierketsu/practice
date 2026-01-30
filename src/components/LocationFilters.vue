<template>
  <div class="bg-white dark:bg-[#1a1a1a] p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-0 relative" style="border-top-color: #1D4ED8; border-top-width: 6px;">
    <div class="flex items-center justify-between mb-3 sm:mb-4 gap-2 pr-10 sm:pr-12">
      <h3 class="filter-placeholder-heading">
        <span class="hidden sm:inline-block">
          <span class="filter-placeholder-brace">{</span> выберите<br>место учебы <span class="filter-placeholder-brace">}</span>
        </span>
        <span class="sm:hidden">
          <span class="filter-placeholder-brace">{</span> выберите место учебы <span class="filter-placeholder-brace">}</span>
        </span>
      </h3>
      <button
        @click="clearFilters"
        :disabled="!hasActiveFilters"
        class="px-2 py-1.5 sm:px-4 sm:py-2 bg-[#1D4ED8] hover:bg-[#164bc2] transition-colors font-medium text-xs sm:text-base flex items-center justify-center absolute top-0 right-0 rounded-bl-lg"
        :style="!hasActiveFilters ? 'visibility: hidden' : ''"
      >
        <img
          src="/sbros2.png"
          alt="Сбросить фильтры"
          class="h-4 w-auto sm:h-5"
        />
      </button>
    </div>
    
    <div class="flex flex-col gap-3 mb-4">
      <!-- Город -->
      <div class="relative">
        <label class="block font-medium text-xs sm:text-base text-[#000000] dark:text-white mb-2">
          город
        </label>
        <button
          @click="toggleDropdown('city')"
          class="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white rounded-lg border border-transparent dark:border-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors font-medium text-sm sm:text-base flex items-center justify-between"
        >
          <span>{{ selectedCity || 'все города' }}</span>
          <svg 
            class="w-5 h-5 transition-transform" 
            :class="{ 'rotate-180': dropdowns.city }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="dropdowns.city"
          class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          <button
            @click="selectCity('')"
            class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            все города
          </button>
          <button
            v-for="city in store.cities"
            :key="city"
            @click="selectCity(city)"
            class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {{ city }}
          </button>
        </div>
      </div>

      <!-- Университет -->
      <div class="relative mt-4">
        <label class="block font-medium text-xs sm:text-base text-[#000000] dark:text-white mb-2">
          университет
        </label>
        <button
          @click="toggleDropdown('university')"
          :disabled="!selectedCity && store.cities.length > 0"
          class="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white rounded-lg border border-transparent dark:border-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors font-medium text-sm sm:text-base flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{{ selectedUniversity || 'выберите университет' }}</span>
          <svg 
            class="w-5 h-5 transition-transform" 
            :class="{ 'rotate-180': dropdowns.university }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="dropdowns.university"
          class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          <button
            @click="selectUniversity('')"
            class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            все университеты
          </button>
          <button
            v-for="university in store.universities"
            :key="university"
            @click="selectUniversity(university)"
            class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {{ university }}
          </button>
        </div>
      </div>

      <!-- Факультет -->
      <div class="relative mt-4">
        <label class="block font-medium text-xs sm:text-base text-[#000000] dark:text-white mb-2">
          факультет
        </label>
        <button
          @click="toggleDropdown('faculty')"
          :disabled="!selectedUniversity && store.universities.length > 0"
          class="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white rounded-lg border border-transparent dark:border-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors font-medium text-sm sm:text-base flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{{ selectedFaculty || 'выберите факультет' }}</span>
          <svg 
            class="w-5 h-5 transition-transform" 
            :class="{ 'rotate-180': dropdowns.faculty }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="dropdowns.faculty"
          class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          <button
            @click="selectFaculty('')"
            class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            все факультеты
          </button>
          <button
            v-for="faculty in store.faculties"
            :key="faculty"
            @click="selectFaculty(faculty)"
            class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {{ faculty }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useCompaniesStore } from '../stores/companies'

const store = useCompaniesStore()

const dropdowns = ref({
  city: false,
  university: false,
  faculty: false
})

const selectedCity = computed({
  get: () => store.selectedCity,
  set: (value) => store.setLocationFilters(value, store.selectedUniversity, store.selectedFaculty)
})

const selectedUniversity = computed({
  get: () => store.selectedUniversity,
  set: (value) => store.setLocationFilters(store.selectedCity, value, store.selectedFaculty)
})

const selectedFaculty = computed({
  get: () => store.selectedFaculty,
  set: (value) => store.setLocationFilters(store.selectedCity, store.selectedUniversity, value)
})

const hasActiveFilters = computed(() => {
  return !!(selectedCity.value || selectedUniversity.value || selectedFaculty.value)
})

// Сброс зависимых фильтров при изменении родительского
watch(() => store.selectedCity, (newCity) => {
  if (!newCity) {
    store.setLocationFilters('', '', '')
  } else if (!store.selectedUniversity) {
    // Если выбран город, но не выбран университет, сбрасываем факультет
    if (store.selectedFaculty) {
      store.setLocationFilters(newCity, '', '')
    }
  }
})

watch(() => store.selectedUniversity, (newUniversity) => {
  if (!newUniversity && store.selectedFaculty) {
    // Если сброшен университет, сбрасываем факультет
    store.setLocationFilters(store.selectedCity, '', '')
  }
})

function toggleDropdown(type) {
  const wasOpen = dropdowns.value[type]
  dropdowns.value.city = false
  dropdowns.value.university = false
  dropdowns.value.faculty = false
  if (!wasOpen) {
    dropdowns.value[type] = true
  }
}

function selectCity(city) {
  selectedCity.value = city
  dropdowns.value.city = false
  // Сбрасываем зависимые фильтры
  if (!city) {
    store.setLocationFilters('', '', '')
  } else {
    store.setLocationFilters(city, '', '')
  }
}

function selectUniversity(university) {
  selectedUniversity.value = university
  dropdowns.value.university = false
  // Сбрасываем факультет при изменении университета
  if (!university) {
    store.setLocationFilters(store.selectedCity, '', '')
  } else {
    store.setLocationFilters(store.selectedCity, university, '')
  }
}

function selectFaculty(faculty) {
  selectedFaculty.value = faculty
  dropdowns.value.faculty = false
  store.setLocationFilters(store.selectedCity, store.selectedUniversity, faculty)
}

function clearFilters() {
  store.setLocationFilters('', '', '')
  dropdowns.value.city = false
  dropdowns.value.university = false
  dropdowns.value.faculty = false
}

function toLowerCaseFirst(str) {
  if (!str) return ''
  return str.charAt(0).toLowerCase() + str.slice(1)
}
</script>

<style scoped>
.filter-placeholder-heading {
  font-family: 'Space Grotesk', sans-serif;
  color: rgb(10 10 10);
  margin: 0;
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 900;
  text-transform: uppercase;
  -webkit-tap-highlight-color: transparent;
}

.filter-placeholder-brace {
  color: #164BC1;
}
</style>
