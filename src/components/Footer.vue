<template>
  <footer class="mt-auto" :class="{ 'footer-top-border': !isCompanyPage }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p v-if="!isCompanyPage" class="site-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8 w-full text-[#000000] dark:text-white uppercase tracking-tight">
        <span class="site-title-highlight-wrap">практика</span><span class="site-title-rest">студентам.рф</span>
      </p>
      <div v-if="!isCompanyPage" class="flex flex-col sm:flex-row gap-4 py-4">
        <a href="https://t.me/schierketsu" target="_blank" rel="noopener noreferrer" class="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
          <img :src="isDark ? '/icontelegramdark.png' : '/icontelegram.png'" alt="Telegram" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          <span>моя телега</span>
        </a>
        <a href="mailto:crumplemi@yandex.ru" class="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
          <img :src="isDark ? '/iconemaildark.png' : '/iconemail.png'" alt="Email" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          <span>отправить письмо</span>
        </a>
      </div>
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
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const route = useRoute()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// Проверяем, находимся ли мы на странице детальной информации о компании
const isCompanyPage = computed(() => {
  return route.path.startsWith('/компания/')
})
</script>

<style scoped>
.footer-top-border {
  border-top: 4px solid #000;
}

.site-title {
  margin-bottom: 0.5rem;
  line-height: 1.15;
  letter-spacing: 0.02em;
}

@media (min-width: 1024px) {
  .site-title {
    margin-bottom: 1rem;
  }
}

/* Первая часть — прямоугольный зелёный блок, как «О СЕБЕ» на референсе */
.site-title-highlight-wrap {
  display: inline-block;
  background-color: #7AFC50;
  color: #000;
  padding: 0.25em 0.2em 0.25em 0.6em;
  margin-right: 0;
  border-radius: 0;
}

.site-title-rest {
  display: inline;
}
</style>

