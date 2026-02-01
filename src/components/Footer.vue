<template>
  <footer class="mt-auto bg-black text-white footer-top-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-row flex-wrap items-center justify-between gap-4 pt-6 sm:pt-8 pb-1 sm:pb-2">
        <p class="site-title">
          <span class="site-title-highlight-wrap">практика</span><span class="site-title-rest">студентам.рф</span>
        </p>
        <div class="flex flex-row gap-3 items-center">
          <a href="https://github.com/schierketsu" target="_blank" rel="noopener noreferrer" class="footer-icon-btn footer-icon-btn-email inline-flex items-center justify-center flex-shrink-0 rounded-none transition-colors" title="мой гитхаб">
            <svg class="footer-icon-btn-img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
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
  background-color: #85CBFA !important;
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

