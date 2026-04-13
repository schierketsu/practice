<template>
  <span 
    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
    :style="getTechStyle()"
  >
    {{ technology }}
  </span>
</template>

<script setup>
import { useCompaniesStore } from '../stores/companies'

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

const store = useCompaniesStore()

function getTechStyle() {
  if (!props.isSelected) {
    return 'background-color: #F3F4F6; color: #212121'
  }
  if (store.isFrontendTechnology(props.technology)) {
    return 'background-color: #1D4ED8; color: #ffffff'
  }
  return 'background-color: #A8E4A0; color: #212121'
}
</script>

