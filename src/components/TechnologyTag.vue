<template>
  <span 
    :class="[
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    ]"
  >
    {{ technology }}
  </span>
</template>

<script setup>
defineProps({
  technology: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})
</script>

