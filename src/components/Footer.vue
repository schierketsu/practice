<template>
  <footer class="mt-auto bg-black text-white" :class="{ 'footer-top-border': !isCompanyPage }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="!isCompanyPage" class="flex flex-row flex-wrap items-center justify-between gap-4 pt-6 sm:pt-8 pb-1 sm:pb-2">
        <p class="site-title">
          <span class="site-title-highlight-wrap">практика</span><span class="site-title-rest">студентам.рф</span>
        </p>
        <div class="flex flex-row gap-3 items-center">
          <a href="mailto:crumplemi@yandex.ru" class="footer-icon-btn footer-icon-btn-email inline-flex items-center justify-center flex-shrink-0 rounded-none transition-colors" title="отправить письмо">
            <img :src="isDark ? '/iconemaildark.png' : '/iconemail.png'" alt="Email" class="footer-icon-btn-img object-contain" />
          </a>
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-4 sm:pb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-sm text-white">
            сделано с любовью к хорошим практикам
          </p>
          <p class="text-sm text-white">©2025</p>
        </div>
        <div class="flex flex-col gap-1 items-start sm:items-end">
          <a href="#" class="text-sm text-white hover:text-gray-200 underline">
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

// По именам маршрутов — надёжнее, чем сравнение path (редиректы, кодировка)
const isCompanyPage = computed(() => route.name === 'company-detail')
</script>

<style scoped>
.footer-top-border {
  border-top: 4px solid #fff;
}

.site-title {
  font-family: 'Space Grotesk', sans-serif;
  color: #fff;
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

/* Синий фон под «практика» — обрезан по контуру буквы «А» */
.site-title-highlight-wrap {
  display: inline-block;
  position: relative;
  z-index: 0;
  color: #fff;
  padding: 0.25em 0 0.25em 0.6em;
  margin-right: 0.1em;
  border-radius: 0;
  letter-spacing: 0.25em;
}

.site-title-highlight-wrap::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0.25em;
  background-color: #82CAFF;
  z-index: -1;
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

.footer-icon-btn-email {
  background-color: #fff;
  box-shadow: 5px 5px 0 0 #6b7280;
  width: 92px;
  height: 92px;
}

.footer-icon-btn-email .footer-icon-btn-img {
  width: 2.875rem;
  height: 2.875rem;
}

.footer-icon-btn-email:hover {
  background-color: #f0f0f0;
  box-shadow: 0 0 0 0 #6b7280;
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
    width: 92px;
    height: 92px;
  }
  .footer-icon-btn-img {
    width: 2.875rem;
    height: 2.875rem;
  }
}
</style>

