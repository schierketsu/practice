<template>
  <div class="min-h-[30vh]" aria-hidden="true" />
</template>

<script setup>
import { onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const openRegisterModal = inject('openRegisterModal', null)

onMounted(() => {
  openRegisterModal?.()
  router.replace('/практики')
})
</script>
