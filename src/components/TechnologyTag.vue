<template>
  <span 
    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
    :style="getTechStyle()"
  >
    {{ technology }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  technology: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// классификация технологий на фронтенд и бэкенд на основе реальных технологий компаний
const frontendTechs = ['Vue', 'React', 'TypeScript', 'Flutter']
const backendTechs = ['PHP', 'C#', 'C++', 'Python', 'FastAPI', 'Laravel', 'Kotlin', 'Entity']
const otherTechs = ['Битрикс', '1C CRM']

function getTechStyle() {
  if (!props.isSelected) {
    return 'background-color: #F3F4F6; color: #000000'
  }
  
  if (backendTechs.includes(props.technology) || otherTechs.includes(props.technology)) {
    return 'background-color: #57D900; color: #000000'
  }
  
  return 'background-color: #7A3FFF; color: #ffffff'
}
</script>

