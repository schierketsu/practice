<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
    <h1 class="text-2xl font-bold text-black mb-4">Админ-панель</h1>
    <nav class="flex flex-wrap gap-2 mb-6">
      <router-link
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:border-[#212121]"
        active-class="!border-[#212121] bg-gray-50"
      >
        {{ l.label }}
      </router-link>
    </nav>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'

const links = [
  { to: '/админ/пользователи', label: 'Пользователи' },
  { to: '/админ/компании', label: 'Компании' },
  { to: '/админ/отклики', label: 'Отклики' },
]
</script>
