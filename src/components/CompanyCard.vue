<template>
  <div
    @click="goToDetail"
    class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md hover:shadow-xl dark:hover:shadow-2xl transition-all cursor-pointer overflow-hidden border border-gray-200 dark:border-0 dark:hover:bg-[#2a2a2a]"
    style="border-left-color: #7A3FFF; border-left-width: 6px;"
  >
    <div class="p-4 sm:p-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-gray-200 dark:border-none bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            :src="company.logo"
            :alt="company.name"
            @error="handleImageError"
            class="w-full h-full object-contain"
            :class="{ 'hidden': imageError }"
          />
          <div v-if="imageError" class="text-xs font-medium text-gray-500 dark:text-gray-400 text-center px-1">
            {{ getPlaceholderText(company.name) }}
          </div>
        </div>
        <div class="flex-1 flex flex-col justify-center min-h-12 sm:min-h-16">
          <h3 class="text-xl sm:text-2xl md:text-3xl font-extrabold mb-0.5 leading-tight text-[#000000] dark:text-white">{{ company.name }}</h3>
          <p class="text-sm sm:text-base text-gray-500 dark:text-white leading-tight">
            {{ company.sector }}
          </p>
        </div>
      </div>
      
      <p class="text-gray-700 dark:text-white mb-4 line-clamp-2">{{ company.description }}</p>
      
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tech in sortedTechnologies.slice(0, 4)"
          :key="tech"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
          :style="getTechStyle(tech)"
        >
          {{ tech }}
        </span>
        <span
          v-if="company.technologies.length > 4"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          +{{ company.technologies.length - 4 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCompaniesStore } from '../stores/companies'

const props = defineProps({
  company: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const imageError = ref(false)
const store = useCompaniesStore()

const frontendTechs = ['Vue', 'React', 'TypeScript', 'Flutter']
const backendTechs = ['PHP', 'C#', 'C++', 'Python', 'FastAPI', 'Laravel', 'Kotlin', 'Entity']
const otherTechs = ['Битрикс', '1C CRM']

const selectedTechnologies = computed(() => store.selectedTechnologies)

const sortedTechnologies = computed(() => {
  const selected = props.company.technologies.filter(tech => selectedTechnologies.value.includes(tech))
  const notSelected = props.company.technologies.filter(tech => !selectedTechnologies.value.includes(tech))
  return [...selected, ...notSelected]
})

function goToDetail() {
  router.push(`/компания/${props.company.id}`)
}

function handleImageError(event) {
  imageError.value = true
}

function getPlaceholderText(name) {
  if (name.length <= 3) {
    return name
  }
  return name.charAt(0).toUpperCase()
}

function getTechStyle(tech) {
  const isSelected = selectedTechnologies.value.includes(tech)
  
  if (!isSelected) {
    return 'background-color: #F3F4F6; color: #000000'
  }
  
  if (backendTechs.includes(tech) || otherTechs.includes(tech)) {
    return 'background-color: #57D900; color: #000000'
  }
  
  return 'background-color: #7A3FFF; color: #ffffff'
}
</script>

