<template>
  <footer class="mt-auto" :class="{ 'footer-top-border': !isCompanyPage }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="!isCompanyPage" class="flex flex-row flex-wrap items-center justify-between gap-4 pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8">
        <p class="site-title">
          <span class="site-title-highlight-wrap">практика</span><span class="site-title-rest">студентам.рф</span>
        </p>
        <div class="flex flex-row gap-9">
          <a href="https://t.me/schierketsu" target="_blank" rel="noopener noreferrer" class="footer-icon-btn inline-flex items-center justify-center flex-shrink-0 rounded-none transition-colors" title="моя телега">
            <img :src="isDark ? '/icontelegramdark.png' : '/icontelegram.png'" alt="Telegram" class="footer-icon-btn-img object-contain" />
          </a>
          <a href="mailto:crumplemi@yandex.ru" class="footer-icon-btn inline-flex items-center justify-center flex-shrink-0 rounded-none transition-colors" title="отправить письмо">
            <img :src="isDark ? '/iconemaildark.png' : '/iconemail.png'" alt="Email" class="footer-icon-btn-img object-contain" />
          </a>
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-sm text-gray-600 dark:text-white">
            сделано с любовью к хорошим практикам
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
  font-family: 'Space Grotesk', sans-serif;
  color: rgb(10 10 10);
  margin: 0;
  font-size: 2.5rem;
  line-height: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .site-title {
    font-size: 2.75rem;
    line-height: 3.25rem;
  }
}

@media (min-width: 1024px) {
  .site-title {
    font-size: 3.5rem;
    line-height: 4rem;
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

/* Квадратные кнопки-иконки: как активная кнопка «стажировки» по умолчанию */
.footer-icon-btn {
  width: 3.09rem;   /* 1.65 × 1.875rem (text-3xl) */
  height: 3.09rem;
  background-color: #82CAFF;
  color: #000;
  border: 2px solid #000;
  box-shadow: 5px 5px 0 0 #000;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.footer-icon-btn:hover {
  background-color: #6bb8f0;
  box-shadow: 0 0 0 0 #000;
  transform: translate(5px, 5px);
}

.footer-icon-btn-img {
  width: 1.55rem;
  height: 1.55rem;
}

@media (min-width: 640px) {
  .footer-icon-btn {
    width: 3.71rem;  /* 1.65 × 2.25rem (text-4xl) */
    height: 3.71rem;
  }
  .footer-icon-btn-img {
    width: 1.85rem;
    height: 1.85rem;
  }
}

@media (min-width: 768px) {
  .footer-icon-btn {
    width: 4.95rem;  /* 1.65 × 3rem (text-5xl) */
    height: 4.95rem;
  }
  .footer-icon-btn-img {
    width: 2.5rem;
    height: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .footer-icon-btn {
    width: 6.19rem;  /* 1.65 × 3.75rem (text-6xl) */
    height: 6.19rem;
  }
  .footer-icon-btn-img {
    width: 3.1rem;
    height: 3.1rem;
  }
}
</style>

