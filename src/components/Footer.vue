<template>
  <footer class="mt-auto bg-blue-700 text-white footer-top-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-row flex-wrap items-center gap-4 pt-6 sm:pt-8 pb-1 sm:pb-2">
        <p class="site-title">
          <span class="site-title-highlight-wrap">практика</span><span class="site-title-rest">студентам.рф</span>
        </p>
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

<style scoped>
.footer-top-border {
  border-top: 4px solid #fff;
}

.site-title {
  font-family: 'Polonium', serif;
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
  letter-spacing: normal;
}

.site-title-highlight-wrap::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #85CBFA !important;
  z-index: -1;
  border-radius: 0;
}

.site-title-rest {
  display: inline;
}
</style>

