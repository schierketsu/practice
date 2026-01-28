<template>
  <div class="min-h-screen bg-[#F9FAFB] dark:bg-[#000000] transition-colors flex flex-col">
    <header class="bg-[#F9FAFB] dark:bg-[#000000] transition-colors">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-3">
            <button
              @click="themeStore.toggleTheme()"
              class="p-1.5 sm:p-2 text-gray-700 dark:text-white hover:opacity-70 transition-opacity flex items-center justify-center"
            >
              <img v-if="!themeStore.isDark" src="/light.png" alt="Light" class="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              <img v-else src="/dark.png" alt="Dark" class="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            </button>
            <button class="px-2 py-1.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-xs sm:text-base bg-[#A8E4A0] text-[#000000] hover:bg-[#A8E4A0] transition-colors whitespace-nowrap">
              <span class="hidden sm:inline">мой профиль</span>
              <span class="sm:hidden">профиль</span>
            </button>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <router-link
              v-if="$route.path !== '/стажировки'"
              to="/стажировки"
              class="px-2 py-1.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-xs sm:text-base bg-[#A8E4A0] text-[#000000] hover:bg-[#A8E4A0] transition-colors inline-block no-underline whitespace-nowrap"
            >
              стажировки
            </router-link>
            <router-link
              v-else
              to="/практики"
              class="px-2 py-1.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-xs sm:text-base bg-[#A8E4A0] text-[#000000] hover:bg-[#A8E4A0] transition-colors inline-block no-underline whitespace-nowrap"
            >
              практики
            </router-link>
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import Footer from './components/Footer.vue'

const themeStore = useThemeStore()
</script>

