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
        class="absolute top-0 right-0 box-border flex size-9 shrink-0 items-center justify-center rounded-bl-lg border-0 border-b-[3px] border-l-[3px] border-solid border-[#212121] bg-[#1D4ED8] p-0 transition-colors hover:bg-[#164bc2] sm:size-10"
        :style="!hasActiveFilters ? 'visibility: hidden' : ''"
      >
        <img
          src="/sbros2.png"
          alt="Сбросить фильтры"
          class="h-5 w-5 object-contain sm:h-6 sm:w-6"
        />
      </button>
    </div>
    
    <div class="flex flex-col gap-3 mb-4">
      <!-- Город -->
      <div class="relative" :class="{ 'z-30': dropdowns.city }">
        <label class="block font-medium text-xs sm:text-base text-black dark:text-white mb-2">
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
          class="absolute top-full left-0 right-0 z-[100] mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white dark:bg-[#1a1a1a]"
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
      <div class="relative mt-4" :class="{ 'z-30': dropdowns.university }">
        <label class="block font-medium text-xs sm:text-base text-black dark:text-white mb-2">
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
          class="absolute top-full left-0 right-0 z-[100] mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white dark:bg-[#1a1a1a]"
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
      <div class="relative mt-4" :class="{ 'z-30': dropdowns.faculty }">
        <label class="block font-medium text-xs sm:text-base text-black dark:text-white mb-2">
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
          class="absolute top-full left-0 right-0 z-[100] mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white dark:bg-[#1a1a1a]"
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
  store.dismissMobileMapCompanyCard()
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
  font-family: 'Polonium', serif;
  color: rgb(33 33 33);
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .filter-placeholder-heading {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

.filter-placeholder-brace {
  color: rgba(22, 75, 193, 1);
}
</style>
