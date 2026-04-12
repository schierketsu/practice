<template>
  <div
    class="w-full h-full min-h-[260px] sm:min-h-[400px] lg:min-h-[500px] rounded-lg overflow-hidden border-l border-t border-b border-gray-200 dark:border-white map-wrap"
    style="border-right: none;"
  >
    <div
      class="map-loading-placeholder absolute inset-0 z-[20] flex items-center justify-center bg-gray-100 text-gray-700 transition-opacity duration-200 dark:bg-[#1a1a1a] dark:text-gray-200"
      :class="mapReady ? 'pointer-events-none opacity-0' : 'opacity-100'"
      :aria-busy="!mapReady"
      aria-live="polite"
    >
      <p class="map-loading-text text-center text-black dark:text-white">Ожидайте...</p>
    </div>
    <div ref="mapContainer" class="w-full h-full min-h-[260px] sm:min-h-[400px] lg:min-h-[500px] map-container"></div>

    <!-- Мобильная карточка: снизу слоя карты, с полями по краям (не попап у метки) -->
    <Transition name="map-sheet">
      <div
        v-if="isMobileUi && selectedMobileCompany"
        class="map-mobile-sheet pointer-events-none absolute inset-x-0 bottom-0 z-[35] sm:hidden flex flex-col items-stretch px-3"
      >
        <div
          class="pointer-events-auto mb-[max(0.5rem,env(safe-area-inset-bottom))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.1)] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:shadow-[0_-6px_24px_rgba(0,0,0,0.45)]"
        >
          <div class="flex items-stretch gap-0">
            <div class="flex min-w-0 flex-1 gap-3 p-3 pr-2">
              <div
                class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-[#2a2a2a] dark:bg-[#2a2a2a]"
              >
                <img
                  v-show="!sheetLogoError"
                  :src="selectedMobileCompany.logo"
                  :alt="selectedMobileCompany.name"
                  class="h-full w-full object-contain"
                  @error="onSheetLogoError"
                />
                <div
                  v-if="sheetLogoError"
                  class="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400"
                >
                  {{ sheetLogoPlaceholder }}
                </div>
              </div>
              <div class="min-w-0 flex-1 py-0.5">
                <h3 class="font-mono text-[15px] font-extrabold leading-snug text-[#212121] dark:text-white">
                  {{ selectedMobileCompany.name }}
                </h3>
                <p class="mt-0.5 font-mono text-xs font-semibold uppercase leading-tight text-gray-500 dark:text-gray-400">
                  {{ selectedMobileCompany.sector }}
                </p>
                <div class="mt-2 flex min-h-[1.25rem] flex-nowrap items-center gap-1.5">
                  <span
                    v-for="(item, idx) in mobileSheetTechs.visible"
                    :key="`${item.name}-${idx}`"
                    class="inline-flex min-w-0 max-w-[min(9rem,46vw)] shrink items-center truncate rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium leading-none"
                    :style="getTechStyleVue(item.name)"
                    :title="item.name"
                  >
                    {{ item.name }}
                  </span>
                  <span
                    v-if="mobileSheetTechs.more > 0"
                    class="inline-flex flex-shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums leading-none text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-300"
                  >
                    +{{ mobileSheetTechs.more }}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="flex w-[52px] flex-shrink-0 items-center justify-center rounded-r-2xl border-l border-gray-200 bg-[#1D4ED8] text-white transition-colors active:bg-[#164bc2] dark:border-[#2a2a2a]"
              aria-label="Открыть страницу компании"
              @click="goToCompany(selectedMobileCompany)"
            >
              <img src="/arrowright2.png" alt="" class="h-5 w-5 max-h-5 max-w-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { Map, Marker, Popup, config } from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import { ref, onMounted, onUnmounted, watch, computed, shallowRef, markRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'

const router = useRouter()

let markersUpdateScheduled = null
let resizeRaf = null
let popupResizeDebounce = null

const mapContainer = ref(null)
const map = shallowRef(null)
const mapReady = ref(false)
let markers = []
let resizeObserver = null
let revealFallbackTimer = null

const store = useCompaniesStore()
const { mobileMapSelectedCompanyId } = storeToRefs(store)
const themeStore = useThemeStore()

// MapTiler использует [lng, lat]; центр — Европейская часть России
const defaultCenter = [40.0, 55.5]
const defaultZoom = 5
/** Плавное перемещение камеры при смене города / границ (мс) */
const CAMERA_DURATION_MS = 1600

const filteredCompanies = computed(() => store.filteredCompanies)
const isDark = computed(() => themeStore.isDark)

const backendTechs = ['PHP', 'C#', 'C++', 'Python', 'FastAPI', 'Laravel', 'Kotlin', 'Entity']
const otherTechs = ['Битрикс', '1C CRM']

/** Мобильная нижняя панель вместо попапа у метки (< sm); id — в Pinia для сброса с кнопки фильтров */
const isMobileUi = ref(false)
const sheetLogoError = ref(false)

const selectedMobileCompany = computed(() => {
  const id = mobileMapSelectedCompanyId.value
  if (id == null) return null
  return filteredCompanies.value.find((c) => c.id === id) ?? null
})

/** Одна строка: до двух коротких стеков, иначе один (+ обрезка) и +N */
const mobileSheetTechs = computed(() => {
  const techs = selectedMobileCompany.value?.technologies ?? []
  if (techs.length === 0) return { visible: [], more: 0 }

  const maxShort = 10
  if (techs.length === 1) {
    return { visible: [{ name: techs[0] }], more: 0 }
  }
  const a = techs[0]
  const b = techs[1]
  if (a.length <= maxShort && b.length <= maxShort) {
    return {
      visible: [{ name: a }, { name: b }],
      more: Math.max(0, techs.length - 2),
    }
  }
  return {
    visible: [{ name: a }],
    more: techs.length - 1,
  }
})

const sheetLogoPlaceholder = computed(() => {
  const n = selectedMobileCompany.value?.name || ''
  if (n.length <= 3) return n
  return n.charAt(0).toUpperCase()
})

function getTechStyleVue(tech) {
  const selected = store.selectedTechnologies.includes(tech)
  if (!selected) {
    return {
      backgroundColor: isDark.value ? '#2a2a2a' : '#F3F4F6',
      color: isDark.value ? '#ffffff' : '#212121',
    }
  }
  if (backendTechs.includes(tech) || otherTechs.includes(tech)) {
    return { backgroundColor: '#A8E4A0', color: '#212121' }
  }
  return { backgroundColor: '#1D4ED8', color: '#ffffff' }
}

function onSheetLogoError() {
  sheetLogoError.value = true
}

function goToCompany(company) {
  if (!company) return
  const seg = company.slug != null && String(company.slug).trim() !== '' ? company.slug : company.id
  router.push(`/компания/${encodeURIComponent(String(seg))}`)
}

watch(selectedMobileCompany, () => {
  sheetLogoError.value = false
})

function getTechStyle(tech, isSelected) {
  if (!isSelected) {
    return isDark.value
      ? 'background-color: #2a2a2a; color: #ffffff'
      : 'background-color: #F3F4F6; color: #212121'
  }
  if (backendTechs.includes(tech) || otherTechs.includes(tech)) {
    return 'background-color: #A8E4A0; color: #212121'
  }
  return 'background-color: #1D4ED8; color: #ffffff'
}

/** Макс. ширина попапа по ширине экрана (мобильные не разъезжаются за край) */
function getViewportPopupCapPx() {
  if (typeof window === 'undefined') return 400
  return Math.max(252, Math.min(window.innerWidth - 20, 480))
}

/** Ширина попапа: на десктопе шире при длинном названии; на мобильных — не шире экрана */
function getPopupSizing(name) {
  const cap = getViewportPopupCapPx()
  const len = [...(name || '')].length
  let maxPx = 300
  if (len > 14) maxPx = 460
  else if (len > 10) maxPx = 420
  else if (len > 8) maxPx = 400
  else if (len > 6) maxPx = 360
  return `${Math.min(maxPx, cap)}px`
}

function createPopupContent(company) {
  const linkSeg =
    company.slug != null && String(company.slug).trim() !== ''
      ? String(company.slug).trim()
      : company.id
  const companyPathEncoded = encodeURIComponent(String(linkSeg))
  /** Попап только на sm+; на мобильных карточка внизу слоя */
  const narrow = false
  const maxW = getPopupSizing(company.name)
  const bgColor = isDark.value ? '#1a1a1a' : '#ffffff'
  const textColor = isDark.value ? '#ffffff' : '#212121'
  const textSecondary = isDark.value ? '#a0a0a0' : '#666666'
  const borderColor = isDark.value ? '#2a2a2a' : '#e5e7eb'

  const padY = narrow ? 10 : 16
  const padX = narrow ? 12 : 16
  const btnW = narrow ? 44 : 49
  const padRight = btnW + (narrow ? 8 : 11)
  const logoPx = narrow ? 40 : 48
  const titlePx = narrow ? 15 : 18
  const sectorPx = narrow ? 12 : 13
  const tagFs = narrow ? 10 : 11
  const tagPad = narrow ? '3px 9px' : '4px 12px'
  const minW = narrow ? '0' : '280px'
  const boxW = narrow ? '100%' : 'max-content'

  const techsToShow = company.technologies.slice(0, 2)
  const hasMoreTechs = company.technologies.length > 2

  const techTags = techsToShow
    .map((tech) => {
      const isSelected = store.selectedTechnologies.includes(tech)
      const style = getTechStyle(tech, isSelected)
      return `<span style="display: inline-flex; align-items: center; padding: ${tagPad}; border-radius: 9999px; font-size: ${tagFs}px; font-weight: 500; margin-right: 6px; margin-bottom: 6px; line-height: 1; ${style}">${tech}</span>`
    })
    .join('')

  const moreTechsBadge = hasMoreTechs
    ? `<span style="display: inline-flex; align-items: center; padding: ${tagPad}; border-radius: 9999px; font-size: ${tagFs}px; font-weight: 500; margin-right: 6px; margin-bottom: 6px; background-color: ${isDark.value ? '#2a2a2a' : '#F3F4F6'}; color: ${isDark.value ? '#ffffff' : '#666666'}; line-height: 1;">+${company.technologies.length - 2}</span>`
    : ''

  return `
    <div style="min-width: ${minW}; max-width: ${maxW}; width: ${boxW}; box-sizing: border-box; font-family: 'JetBrains Mono', ui-monospace, monospace; background-color: ${bgColor}; border-radius: 12px; overflow: hidden; position: relative;">
      <div style="padding: ${padY}px ${padX}px; padding-right: ${padRight}px;">
        <div style="display: flex; align-items: flex-start; gap: ${narrow ? 8 : 12}px; margin-bottom: ${narrow ? 8 : 12}px;">
          <div style="width: ${logoPx}px; height: ${logoPx}px; border-radius: 8px; border: 1px solid ${borderColor}; background-color: ${isDark.value ? '#2a2a2a' : '#f3f4f6'}; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; position: relative;">
            <img
              src="${company.logo}"
              alt="${company.name}"
              style="width: 100%; height: 100%; object-fit: contain;"
              onerror="this.style.display='none'; const placeholder = this.parentElement.querySelector('.logo-placeholder'); if(placeholder) placeholder.style.display='flex';"
            />
            <div class="logo-placeholder" style="display: none; position: absolute; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: ${narrow ? 15 : 18}px; font-weight: 600; color: ${textSecondary};">
              ${company.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div style="flex: 1; min-width: 0;">
            <h3 style="font-weight: 800; font-size: ${titlePx}px; margin: 0 0 4px 0; color: ${textColor}; line-height: 1.25; word-break: normal; overflow-wrap: break-word;">${company.name}</h3>
            <p style="font-size: ${sectorPx}px; color: ${textSecondary}; margin: 0; line-height: 1.3;">${company.sector}</p>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0;">
          ${techTags}
          ${moreTechsBadge}
        </div>
      </div>
      <button
        onclick="if(window.__studpraktOpenCompany)window.__studpraktOpenCompany('/компания/${companyPathEncoded}');else window.location.href='/компания/${companyPathEncoded}'"
        style="position: absolute; top: 0; right: 0; bottom: 0; width: ${btnW}px; padding-left: 8px; padding-right: 8px; background-color: #1D4ED8; color: #ffffff; border: none; border-radius: 0 12px 12px 0; font-weight: 700; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; margin: 0;"
        onmouseover="this.style.backgroundColor='#164bc2'"
        onmouseout="this.style.backgroundColor='#1D4ED8'"
      >
        <img src="/arrowright2.png" alt="→" style="width: auto; height: auto; max-width: ${narrow ? 20 : 24}px; max-height: ${narrow ? 20 : 24}px; display: block;" />
      </button>
    </div>
  `
}

function updateMarkers() {
  if (!map.value) return

  markers.forEach((m) => m.remove())
  markers = []

  if (store.selectedFaculty) {
    filteredCompanies.value.forEach((company) => {
      if (company.coordinates?.lat != null && company.coordinates?.lng != null) {
        const lngLat = [company.coordinates.lng, company.coordinates.lat]
        const useMobileSheet =
          typeof window !== 'undefined' && window.innerWidth < 640

        const marker = new Marker({ color: '#1D4ED8', anchor: 'bottom' })
          .setLngLat(lngLat)
          .addTo(map.value)

        if (useMobileSheet) {
          const el = marker.getElement()
          if (el) {
            el.style.cursor = 'pointer'
            el.addEventListener('click', (e) => {
              e.stopPropagation()
              mobileMapSelectedCompanyId.value = company.id
            })
          }
        } else {
          const popup = new Popup({
            closeButton: false,
            maxWidth: getPopupSizing(company.name),
            className: isDark.value ? 'dark-popup' : 'light-popup',
          }).setHTML(createPopupContent(company))
          marker.setPopup(popup)
        }

        markers.push(marker)
      }
    })
  }

  // Область отображения (плавный зум / перелёт камеры)
  if (!store.selectedCity) {
    map.value.flyTo({
      center: defaultCenter,
      zoom: defaultZoom,
      duration: CAMERA_DURATION_MS,
      essential: true,
    })
  } else {
    const cityCompanies = store.companies.filter((c) => c.city === store.selectedCity)
    const cityCoords = cityCompanies
      .filter((c) => c.coordinates?.lat != null && c.coordinates?.lng != null)
      .map((c) => [c.coordinates.lng, c.coordinates.lat])

    if (cityCoords.length > 0) {
      if (markers.length > 0) {
        const lngs = cityCoords.map((c) => c[0])
        const lats = cityCoords.map((c) => c[1])
        const padding = 0.1
        const lngSpan = Math.max(0.01, (Math.max(...lngs) - Math.min(...lngs)) * (1 + padding))
        const latSpan = Math.max(0.01, (Math.max(...lats) - Math.min(...lats)) * (1 + padding))
        const sw = [Math.min(...lngs) - lngSpan * padding, Math.min(...lats) - latSpan * padding]
        const ne = [Math.max(...lngs) + lngSpan * padding, Math.max(...lats) + latSpan * padding]
        map.value.fitBounds([sw, ne], {
          padding: 40,
          maxZoom: 14,
          duration: CAMERA_DURATION_MS,
        })
      } else {
        const avgLng = cityCoords.reduce((s, c) => s + c[0], 0) / cityCoords.length
        const avgLat = cityCoords.reduce((s, c) => s + c[1], 0) / cityCoords.length
        map.value.flyTo({
          center: [avgLng, avgLat],
          zoom: 12,
          duration: CAMERA_DURATION_MS,
          essential: true,
        })
      }
    } else {
      map.value.flyTo({
        center: defaultCenter,
        zoom: defaultZoom,
        duration: CAMERA_DURATION_MS,
        essential: true,
      })
    }
  }
}

function scheduleUpdateMarkers() {
  if (markersUpdateScheduled != null) clearTimeout(markersUpdateScheduled)
  markersUpdateScheduled = window.setTimeout(() => {
    markersUpdateScheduled = null
    updateMarkers()
  }, 80)
}

function syncMobileUi() {
  if (typeof window === 'undefined') return
  const next = window.innerWidth < 640
  if (next !== isMobileUi.value) {
    isMobileUi.value = next
    mobileMapSelectedCompanyId.value = null
    scheduleUpdateMarkers()
  } else {
    isMobileUi.value = next
  }
}

onMounted(() => {
  window.__studpraktOpenCompany = (path) => {
    if (typeof path === 'string') router.push(path)
  }

  if (!mapContainer.value) return

  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'Ju1zrsm8seD6T8aFIWmd'
  config.apiKey = apiKey

  map.value = markRaw(
    new Map({
      container: mapContainer.value,
      style: '019c1853-7b1f-7ebc-b0a2-523ad893bc35',
      center: defaultCenter,
      zoom: defaultZoom,
      maptilerLogo: false,
      geolocateControl: false
    })
  )

  map.value.on('load', () => {
    setTimeout(() => {
      const m = map.value
      if (!m) return
      m.resize()
      updateMarkers()
      const reveal = () => {
        if (mapReady.value) return
        mapReady.value = true
        if (revealFallbackTimer != null) {
          clearTimeout(revealFallbackTimer)
          revealFallbackTimer = null
        }
        requestAnimationFrame(() => m.resize())
      }
      // idle часто срабатывает при каждом кадре/тайлах — даёт лаги; показываем карту после первой отрисовки
      requestAnimationFrame(() => {
        requestAnimationFrame(reveal)
      })
      revealFallbackTimer = window.setTimeout(reveal, 12000)
    }, 100)
  })

  resizeObserver = new ResizeObserver(() => {
    if (resizeRaf != null) cancelAnimationFrame(resizeRaf)
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null
      map.value?.resize()
    })
  })
  resizeObserver.observe(mapContainer.value)

  const handleResize = () => {
    map.value?.resize()
    syncMobileUi()
    if (popupResizeDebounce != null) clearTimeout(popupResizeDebounce)
    popupResizeDebounce = window.setTimeout(() => {
      popupResizeDebounce = null
      scheduleUpdateMarkers()
    }, 200)
  }
  window.addEventListener('resize', handleResize)
  if (map.value) map.value._resizeHandler = handleResize

  isMobileUi.value = typeof window !== 'undefined' && window.innerWidth < 640
})

watch(
  filteredCompanies,
  (list) => {
    const id = mobileMapSelectedCompanyId.value
    if (id != null && !list.some((c) => c.id === id)) mobileMapSelectedCompanyId.value = null
    scheduleUpdateMarkers()
  },
  { deep: true }
)

watch(
  [isDark, () => store.selectedTechnologies],
  () => {
    scheduleUpdateMarkers()
    setTimeout(() => map.value?.resize(), 100)
  },
  { deep: true }
)

onUnmounted(() => {
  delete window.__studpraktOpenCompany

  if (markersUpdateScheduled != null) {
    clearTimeout(markersUpdateScheduled)
    markersUpdateScheduled = null
  }
  if (resizeRaf != null) {
    cancelAnimationFrame(resizeRaf)
    resizeRaf = null
  }
  if (revealFallbackTimer != null) {
    clearTimeout(revealFallbackTimer)
    revealFallbackTimer = null
  }
  if (popupResizeDebounce != null) {
    clearTimeout(popupResizeDebounce)
    popupResizeDebounce = null
  }
  if (resizeObserver && mapContainer.value) {
    resizeObserver.unobserve(mapContainer.value)
    resizeObserver.disconnect()
    resizeObserver = null
  }
  const mapInstance = map.value
  if (mapInstance?._resizeHandler) {
    window.removeEventListener('resize', mapInstance._resizeHandler)
  }
  markers.forEach((m) => m.remove())
  markers = []
  map.value?.remove()
  map.value = null
})
</script>

<style scoped>
.map-wrap {
  position: relative;
}
.map-container {
  position: absolute;
  inset: 0;
}

/* Как .filter-placeholder-heading («выберите место учебы») */
.map-loading-text {
  font-family: 'Polonium', serif;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .map-loading-text {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

/* MapTiler SDK — скрываем атрибуцию и водяной знак (логотип) */
:deep(.maplibregl-ctrl-attrib),
:deep(.maptiler-ctrl-attrib),
:deep(.maplibregl-ctrl-logo),
:deep(.maptiler-ctrl-logo),
:deep(.maplibregl-ctrl-maptiler-logo),
:deep(.maptiler-ctrl-maptiler-logo),
:deep(.maplibregl-ctrl-bottom-left),
:deep(.maptiler-ctrl-bottom-left) {
  display: none !important;
}

/* Скрываем кнопку «reset bearing to north» (компас) */
:deep(.maplibregl-ctrl-compass),
:deep(.maptiler-ctrl-compass),
:deep(button[title*="bearing"]),
:deep(button[title*="North"]),
:deep(button[aria-label*="bearing"]),
:deep(button[aria-label*="North"]) {
  display: none !important;
}

:deep(.maplibregl-popup-content),
:deep(.maptiler-popup-content) {
  padding: 0;
  margin: 0;
  background: transparent !important;
}
:deep(.maplibregl-popup-content-wrapper),
:deep(.maptiler-popup-content-wrapper) {
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(33, 33, 33, 0.15);
  overflow: hidden;
  /* Совпадает с фоном карточки — иначе в углах (особенно справа у синей кнопки) просвечивает белый дефолт SDK */
  background-color: #ffffff !important;
}
:deep(.maplibregl-popup.dark-popup .maplibregl-popup-content-wrapper),
:deep(.maptiler-popup.dark-popup .maptiler-popup-content-wrapper) {
  background-color: #1a1a1a !important;
}
:deep(.maplibregl-popup.light-popup .maplibregl-popup-content-wrapper),
:deep(.maptiler-popup.light-popup .maptiler-popup-content-wrapper) {
  background-color: #ffffff !important;
}
.dark :deep(.maplibregl-popup-content-wrapper),
.dark :deep(.maptiler-popup-content-wrapper) {
  box-shadow: 0 10px 25px rgba(33, 33, 33, 0.5);
}
:deep(.maplibregl-popup-tip),
:deep(.maptiler-popup-tip) {
  display: none;
}
:deep(.maplibregl-popup-close-button),
:deep(.maptiler-popup-close-button) {
  display: none;
}

.map-sheet-enter-active,
.map-sheet-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}
.map-sheet-enter-from,
.map-sheet-leave-to {
  transform: translateY(110%);
  opacity: 0;
}
</style>
