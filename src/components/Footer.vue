<template>
  <footer class="mt-auto bg-blue-700 text-white footer-top-border">
    <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-2 pt-6 sm:pt-8 pb-1 sm:pb-2 w-full min-w-0">
        <div class="footer-site-title-wrap">
          <p class="site-title">практикастудентам.рф</p>
        </div>
        <p
          class="footer-contact-mobile m-0 text-sm leading-snug text-white/90 sm:hidden max-w-full"
        >
          По вопросам и предложениям:
          <a
            href="mailto:info@studprakt.ru"
            class="text-white font-medium underline underline-offset-2 decoration-white/70 hover:decoration-white"
          >info@studprakt.ru</a>
        </p>
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

.footer-site-title-wrap {
  width: 100%;
  min-width: 0;
}

.site-title {
  font-family: 'Polonium', serif;
  color: #fff;
  margin: 0;
  font-weight: 900;
  text-transform: uppercase;
  display: block;
  box-sizing: border-box;
  letter-spacing: -0.04em;
  -webkit-tap-highlight-color: transparent;
}

/*
 * Мобильные: одна строка, вся надпись в ширине (#app с overflow-x-hidden).
 * Кегль от cqw/vw с запасом под Polonium + чуть более открытый letter-spacing.
 */
@media (max-width: 639px) {
  .footer-site-title-wrap {
    container-type: inline-size;
    container-name: footer-site;
    overflow-x: visible;
  }

  .site-title {
    white-space: nowrap;
    width: 100%;
    max-width: 100%;
    line-height: 1.08;
    /* Шире трекинг — компенсируем чуть меньшим кеглем / делителем, чтобы не вылезало за экран */
    letter-spacing: 0.045em;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: manual;
    /* vw-запас без cqw */
    font-size: clamp(0.76rem, 3.15vw + 0.3rem, 1.38rem);
  }

  @supports (font-size: 1cqw) {
    .site-title {
      font-size: clamp(0.76rem, calc(100cqw / 20.8), 1.38rem);
    }
  }
}

@media (min-width: 640px) {
  .site-title {
    font-size: 3rem;
    line-height: 3.5rem;
    letter-spacing: 0;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    hyphens: auto;
  }
}

@media (min-width: 1024px) {
  .site-title {
    font-size: 4rem;
    line-height: 4.25rem;
  }
}

@media (min-width: 1280px) {
  .site-title {
    font-size: 4.25rem;
    line-height: 4.5rem;
  }
}

</style>

