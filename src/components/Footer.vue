<template>
  <footer class="mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="site-title text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold pt-3 sm:pt-4 pb-4 sm:pb-6 lg:pb-8 w-full flex justify-between text-[#000000] dark:text-white">
        <span>п</span><span>р</span><span>а</span><span>к</span><span>т</span><span>и</span><span>к</span><span>а</span><span>с</span><span>т</span><span>у</span><span>д</span><span>е</span><span>н</span><span>т</span><span>а</span><span>м</span><span>.</span><span>р</span><span>ф</span>
      </p>
      <div class="flex flex-col sm:flex-row gap-4 py-4">
        <a href="https://t.me/schierketsu" target="_blank" rel="noopener noreferrer" class="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
          <img :src="isDark ? '/icontelegramdark.png' : '/icontelegram.png'" alt="Telegram" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          <span>моя телега</span>
        </a>
        <a href="mailto:crumplemi@yandex.ru" class="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
          <img :src="isDark ? '/iconemaildark.png' : '/iconemail.png'" alt="Email" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          <span>отправить письмо</span>
        </a>
      </div>
      <Divider />
    </div>
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-sm text-gray-600 dark:text-white">
            сделано с любовью к хорошим практикам <span v-if="!isDark">💚</span><span v-else>💙</span>
          </p>
          <p class="text-sm text-gray-600 dark:text-white">©2025</p>
        </div>
        <div class="flex flex-col gap-1 items-start sm:items-end">
          <a href="#" class="text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white underline">
            очень важная ссылка
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import Divider from './Divider.vue'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
</script>

<style scoped>
.site-title {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  min-width: 0;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

@media (min-width: 1024px) {
  .site-title {
    margin-bottom: 1rem;
  }
}

.site-title span {
  display: inline-block;
  transform: scaleY(1.5);
  transform-origin: center;
  flex: 0 0 auto;
  white-space: nowrap;
}
</style>

