<template>
  <div class="filters-map-layer">
    <div class="filters-map-layer-inner max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full pb-4 sm:pb-8">
      <div class="relative">
        <div v-if="store.companies.length === 0" class="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
          <p class="text-gray-500 dark:text-white text-base sm:text-lg">Загрузка...</p>
        </div>
        <div v-else class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-6">
          <!-- Фильтры слева (1/3 ширины на десктопе) -->
          <div class="filters-column w-full lg:w-1/3 flex-shrink-0 overflow-y-auto flex flex-col gap-4">
            <LocationFilters />

            <!-- Фильтр по технологиям - показывается только для Чебоксары, ЧУВГУ ИМ. И. Н. УЛЬЯНОВА, факультет ИВТ -->
            <FilterBar v-if="showTechnologyFilter" />
          </div>

          <!-- Карта справа (2/3 ширины на десктопе, фиксированная высота на мобильных) -->
          <div class="map-column w-full lg:flex-1 flex-shrink-0 h-[calc(100vh-380px)] sm:h-[calc(100vh-360px)] lg:h-[calc(100vh-200px)] min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] max-h-[calc(100vh-380px)] sm:max-h-[calc(100vh-360px)] lg:max-h-none overflow-hidden relative">
            <OrganizationMap />

            <!-- Модальное окно "Организации не найдены" поверх карты -->
            <div
              v-if="showNoResultsModal"
              class="modal-overlay absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4"
              @click.self="closeModal"
            >
              <div class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full overflow-hidden relative">
                <div class="px-6 sm:px-8 pt-6 sm:pt-8 pb-6 text-center">
                  <h3 class="text-xl sm:text-2xl font-extrabold text-[#000000] dark:text-white mb-4">
                    Организации не найдены
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base text-justify">
                    По выбранным фильтрам не найдено ни одной организации. Попробуйте изменить параметры поиска.
                  </p>
                </div>
                <div class="flex items-center">
                  <button
                    @click="clearFiltersAndClose"
                    class="flex-1 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#A8E4A0] text-[#000000] hover:bg-[#98d490] transition-colors font-medium text-xs sm:text-base rounded-bl-lg"
                  >
                    Сбросить фильтры
                  </button>
                  <button
                    @click="closeModal"
                    class="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
                    aria-label="Закрыть"
                  >
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCompaniesStore } from '../stores/companies'
import LocationFilters from '../components/LocationFilters.vue'
import OrganizationMap from '../components/OrganizationMap.vue'
import FilterBar from '../components/FilterBar.vue'

const store = useCompaniesStore()
const showNoResultsModal = ref(false)

onMounted(() => {
  if (store.companies.length === 0) {
    console.error('Companies store is empty')
  }
})

const filteredCompanies = computed(() => {
  return store.filteredCompanies
})

// Показывать фильтр по технологиям только для Чебоксары, ЧУВГУ ИМ. И. Н. УЛЬЯНОВА, факультет ИВТ
const showTechnologyFilter = computed(() => {
  return store.selectedCity === 'Чебоксары' &&
         store.selectedUniversity === 'ЧУВГУ ИМ. И. Н. УЛЬЯНОВА' &&
         store.selectedFaculty === 'факультет ИВТ'
})

// Отслеживаем изменения filteredCompanies и показываем модальное окно, если нет результатов
watch(filteredCompanies, (newValue) => {
  if (store.companies.length > 0 && newValue.length === 0) {
    showNoResultsModal.value = true
  } else {
    showNoResultsModal.value = false
  }
}, { immediate: true })

function clearFilters() {
  store.clearFilters()
}

function closeModal() {
  showNoResultsModal.value = false
}

function clearFiltersAndClose() {
  store.setTechnologiesFilter([])
  closeModal()
}
</script>

<style scoped>
/* Фон как на фото: светлый + равномерная сетка чёрных точек; границы чёрные */
.filters-map-layer {
  min-height: 100%;
  background-color: #fafaf8;
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 20px 20px;
  border: 4px solid #000;
}

.dark .filters-map-layer {
  background-color: #1a1a1a;
  background-image: radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px);
  background-size: 20px 20px;
  border-color: #000;
}

.filters-map-layer-inner {
  min-height: 100%;
}

/* Чёрные границы у блоков фильтров */
.filters-column :deep(> div) {
  border: 3px solid #000 !important;
  border-radius: 0.5rem;
}

/* Чёрные границы у карты */
.map-column :deep(> div) {
  border: 3px solid #000 !important;
  border-right-width: 3px !important;
}

.modal-overlay {
  z-index: 9999 !important;
  position: absolute !important;
  pointer-events: auto !important;
}

:deep(.leaflet-container) {
  z-index: 1;
}

:deep(.leaflet-pane) {
  z-index: 1;
}
</style>

