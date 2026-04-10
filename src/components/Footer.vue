<template>
  <footer class="mt-auto bg-blue-700 text-white footer-top-border">
    <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex flex-row flex-wrap items-center gap-4 pt-6 sm:pt-8 pb-1 sm:pb-2 w-full min-w-0">
        <p class="site-title">практикастудентам.<wbr />рф</p>
      </div>
    </div>
    <div
      class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6"
    >
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-sm text-white">
            сделано с любовью к хорошим практикам
          </p>
          <p class="text-sm text-white">©2025–2026</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-top-border {
  border-top: 4px solid #fff;
}

.site-title {
  font-family: 'Polonium', serif;
  color: #fff;
  margin: 0;
  /* Узкие экраны: сильнее ужимаем, иначе uppercase + длинный домен не влезают */
  font-size: clamp(1rem, 2.7vw + 0.34rem, 2.5rem);
  line-height: 1.12;
  font-weight: 900;
  text-transform: uppercase;
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .site-title {
    font-size: 2.75rem;
    line-height: 3.25rem;
    letter-spacing: 0;
  }
}

@media (min-width: 1024px) {
  .site-title {
    font-size: 3.5rem;
    line-height: 4rem;
  }
}

</style>

