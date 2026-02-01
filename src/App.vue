<template>
  <div class="min-h-screen bg-[#F9FAFB] flex flex-col">
    <header class="bg-[#F9FAFB]">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-3">
            <router-link
              to="/"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base inline-block no-underline whitespace-nowrap"
            >
              <span class="hidden sm:inline">мой профиль</span>
              <span class="sm:hidden">профиль</span>
            </router-link>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <router-link
              v-if="$route.path !== '/стажировки'"
              to="/стажировки"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base inline-block no-underline whitespace-nowrap"
            >
              стажировки
            </router-link>
            <router-link
              v-else
              to="/практики"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base inline-block no-underline whitespace-nowrap"
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
    <div v-if="isHomePage" class="content-footer-layer w-full min-h-[8rem] sm:min-h-[10rem] lg:min-h-[12rem] bg-white flex items-center justify-center">
      <p class="text-gray-500 text-base sm:text-lg">скоро появится</p>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Footer from './components/Footer.vue'

const route = useRoute()
const isHomePage = computed(() => route.name === 'home')
</script>

<style scoped>
/* Неактивное: чёрный фон, белый текст. Активное (hover): голубой фон #85CBFA, чёрный текст, полная чёрная рамка, тень 3D. */
.header-btn {
  background-color: #000;
  color: #fff;
  border: 2px solid transparent;
  box-shadow: none;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.header-btn:hover {
  background-color: #85CBFA;
  color: #000;
  border: 2px solid #000;
  box-shadow: 5px 5px 0 0 #000;
}
</style>

