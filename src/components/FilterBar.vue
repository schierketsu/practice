<template>
  <div class="bg-white dark:bg-[#1a1a1a] p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-0 relative" style="border-top-color: #7A3FFF; border-top-width: 6px;">
    <div class="flex items-center justify-between mb-3 sm:mb-4 gap-2 pr-10 sm:pr-12">
      <h3 class="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#000000] dark:text-white leading-tight">
        <span style="color: #7A3FFF">{</span> <span class="hidden sm:inline">фильтр по технологиям</span><span class="sm:hidden">фильтр</span> <span style="color: #7A3FFF">}</span>
      </h3>
      <button
        @click="clearFilters"
        :disabled="selectedTechnologies.length === 0"
        class="px-2 py-1.5 sm:px-4 sm:py-2 bg-[#7A3FFF] hover:bg-[#6a2fef] transition-colors font-medium text-xs sm:text-base flex items-center justify-center absolute top-0 right-0 rounded-bl-lg"
        :style="selectedTechnologies.length === 0 ? 'visibility: hidden' : ''"
      >
        <img
          src="/sbros2.png"
          alt="Сбросить фильтры"
          class="h-4 w-auto sm:h-5"
        />
      </button>
    </div>
    
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <button
          @click="toggleDropdown('frontend')"
          class="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white rounded-lg border border-transparent dark:border-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors font-medium text-sm sm:text-base flex items-center justify-between"
        >
          <span>Фронтенд</span>
          <svg 
            class="w-5 h-5 transition-transform" 
            :class="{ 'rotate-180': dropdowns.frontend }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="dropdowns.frontend"
          class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          <div class="p-2 flex flex-wrap gap-2">
            <button
              v-for="tech in frontendTechnologies"
              :key="tech"
              @click="toggleTechnology(tech)"
              :class="[
                'px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors',
                selectedTechnologies.includes(tech)
                  ? 'text-white'
                  : ''
              ]"
              :style="selectedTechnologies.includes(tech) ? 'background-color: #7A3FFF' : 'background-color: #F3F4F6; color: #000000'"
            >
              {{ tech }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="relative flex-1">
        <button
          @click="toggleDropdown('backend')"
          class="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white rounded-lg border border-transparent dark:border-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors font-medium text-sm sm:text-base flex items-center justify-between"
        >
          <span>Бэкенд</span>
          <svg 
            class="w-5 h-5 transition-transform" 
            :class="{ 'rotate-180': dropdowns.backend }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="dropdowns.backend"
          class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          <div class="p-2 flex flex-wrap gap-2">
            <button
              v-for="tech in backendTechnologies"
              :key="tech"
              @click="toggleTechnology(tech)"
              :class="[
                'px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors',
                selectedTechnologies.includes(tech)
                  ? ''
                  : ''
              ]"
              :style="selectedTechnologies.includes(tech) ? 'background-color: #A8E4A0; color: #000000' : 'background-color: #F3F4F6; color: #000000'"
            >
              {{ tech }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTechnologies.length > 0" class="flex flex-wrap items-center gap-2">
      <span class="text-sm sm:text-base font-extrabold text-[#000000] dark:text-white">Выбрано:</span>
      <button
        v-for="tech in selectedTechnologies"
        :key="tech"
        @click="toggleTechnology(tech)"
        class="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors"
        :style="getTechStyle(tech)"
      >
        {{ tech }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCompaniesStore } from '../stores/companies'

const store = useCompaniesStore()

const dropdowns = ref({
  frontend: false,
  backend: false
})

// классификация технологий на фронтенд и бэкенд на основе реальных технологий компаний
const frontendTechs = ['Vue', 'React', 'TypeScript', 'Flutter']
const backendTechs = ['PHP', 'C#', 'C++', 'Python', 'FastAPI', 'Laravel', 'Kotlin', 'Entity']
const otherTechs = ['Битрикс', '1C CRM']

const allTechnologies = computed(() => store.allTechnologies)
const selectedTechnologies = computed(() => store.selectedTechnologies)

const frontendTechnologies = computed(() => {
  return allTechnologies.value.filter(tech => frontendTechs.includes(tech)).sort()
})

const backendTechnologies = computed(() => {
  return allTechnologies.value.filter(tech => 
    backendTechs.includes(tech) || otherTechs.includes(tech)
  ).sort()
})

function toggleDropdown(type) {
  const wasOpen = dropdowns.value[type]
  dropdowns.value.frontend = false
  dropdowns.value.backend = false
  if (!wasOpen) {
    dropdowns.value[type] = true
  }
}

function toggleTechnology(tech) {
  const current = [...store.selectedTechnologies]
  const index = current.indexOf(tech)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(tech)
  }
  
  store.setTechnologiesFilter(current)
}

function clearFilters() {
  store.setTechnologiesFilter([])
}

function getTechStyle(tech) {
  if (backendTechs.includes(tech) || otherTechs.includes(tech)) {
    return 'background-color: #A8E4A0; color: #000000'
  }
  return 'background-color: #7A3FFF; color: #ffffff'
}
</script>

