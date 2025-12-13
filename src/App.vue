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
            <button class="px-2 py-1.5 sm:px-6 sm:py-3 rounded-lg font-medium text-xs sm:text-base bg-[#57D900] text-[#000000] hover:bg-[#4ac000] transition-colors whitespace-nowrap">
              <span class="hidden sm:inline">мой профиль</span>
              <span class="sm:hidden">профиль</span>
            </button>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="relative">
              <button
                @click="toggleCityDropdown"
                class="px-2 py-1.5 sm:px-6 sm:py-3 bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors font-medium text-xs sm:text-base flex items-center justify-between gap-1 sm:gap-2"
              >
                <span class="hidden sm:inline">{{ selectedCity }}</span>
                <span class="sm:hidden text-xs">город</span>
                <svg 
                  class="w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0" 
                  :class="{ 'rotate-180': cityDropdownOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                v-if="cityDropdownOpen"
                class="absolute top-full right-0 sm:left-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white rounded-lg shadow-lg z-10 min-w-[120px] sm:min-w-full"
              >
                <button
                  v-for="city in cities"
                  :key="city"
                  @click="selectCity(city)"
                  class="w-full px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {{ city }}
                </button>
              </div>
            </div>
            <router-link
              v-if="$route.path !== '/стажировки'"
              to="/стажировки"
              class="px-2 py-1.5 sm:px-6 sm:py-3 rounded-lg font-medium text-xs sm:text-base bg-[#57D900] text-[#000000] hover:bg-[#4ac000] transition-colors inline-block no-underline whitespace-nowrap"
            >
              стажировки
            </router-link>
            <router-link
              v-else
              to="/практики"
              class="px-2 py-1.5 sm:px-6 sm:py-3 rounded-lg font-medium text-xs sm:text-base bg-[#57D900] text-[#000000] hover:bg-[#4ac000] transition-colors inline-block no-underline whitespace-nowrap"
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
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import Footer from './components/Footer.vue'

const themeStore = useThemeStore()
const cityDropdownOpen = ref(false)
const selectedCity = ref('не выбран')
const cities = ['не выбран', 'Чебоксары']

function toggleCityDropdown() {
  cityDropdownOpen.value = !cityDropdownOpen.value
}

function selectCity(city) {
  selectedCity.value = city
  cityDropdownOpen.value = false
}
</script>

