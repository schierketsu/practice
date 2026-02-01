<template>
  <div class="w-full h-full min-h-[400px] sm:min-h-[500px] rounded-lg overflow-hidden border-l border-t border-b border-gray-200 dark:border-white map-wrap" style="border-right: none;">
    <div ref="mapContainer" class="w-full h-full min-h-[400px] sm:min-h-[500px] map-container"></div>
  </div>
</template>

<script setup>
import { Map, Marker, Popup, config } from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import { ref, onMounted, onUnmounted, watch, computed, shallowRef, markRaw } from 'vue'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'

const mapContainer = ref(null)
const map = shallowRef(null)
let markers = []
let resizeObserver = null

const store = useCompaniesStore()
const themeStore = useThemeStore()

// MapTiler использует [lng, lat]; центр — Европейская часть России
const defaultCenter = [40.0, 55.5]
const defaultZoom = 5

const filteredCompanies = computed(() => store.filteredCompanies)
const isDark = computed(() => themeStore.isDark)

// Классификация технологий для стилизации
const frontendTechs = ['Vue', 'React', 'TypeScript', 'Flutter']
const backendTechs = ['PHP', 'C#', 'C++', 'Python', 'FastAPI', 'Laravel', 'Kotlin', 'Entity']
const otherTechs = ['Битрикс', '1C CRM']

function getTechStyle(tech, isSelected) {
  if (!isSelected) {
    return isDark.value
      ? 'background-color: #2a2a2a; color: #ffffff'
      : 'background-color: #F3F4F6; color: #000000'
  }
  if (backendTechs.includes(tech) || otherTechs.includes(tech)) {
    return 'background-color: #A8E4A0; color: #000000'
  }
  return 'background-color: #1D4ED8; color: #ffffff'
}

function createPopupContent(company) {
  const bgColor = isDark.value ? '#1a1a1a' : '#ffffff'
  const textColor = isDark.value ? '#ffffff' : '#000000'
  const textSecondary = isDark.value ? '#a0a0a0' : '#666666'
  const borderColor = isDark.value ? '#2a2a2a' : '#e5e7eb'

  const techsToShow = company.technologies.slice(0, 2)
  const hasMoreTechs = company.technologies.length > 2

  const techTags = techsToShow
    .map((tech) => {
      const isSelected = store.selectedTechnologies.includes(tech)
      const style = getTechStyle(tech, isSelected)
      return `<span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 500; margin-right: 6px; margin-bottom: 6px; line-height: 1; ${style}">${tech}</span>`
    })
    .join('')

  const moreTechsBadge = hasMoreTechs
    ? `<span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 500; margin-right: 6px; margin-bottom: 6px; background-color: ${isDark.value ? '#2a2a2a' : '#F3F4F6'}; color: ${isDark.value ? '#ffffff' : '#666666'}; line-height: 1;">+${company.technologies.length - 2}</span>`
    : ''

  return `
    <div style="min-width: 280px; max-width: 320px; font-family: 'Inter', sans-serif; background-color: ${bgColor}; border-radius: 12px; overflow: hidden; position: relative;">
      <div style="padding: 16px; padding-right: 60px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 8px; border: 1px solid ${borderColor}; background-color: ${isDark.value ? '#2a2a2a' : '#f3f4f6'}; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; position: relative;">
            <img
              src="${company.logo}"
              alt="${company.name}"
              style="width: 100%; height: 100%; object-fit: contain;"
              onerror="this.style.display='none'; const placeholder = this.parentElement.querySelector('.logo-placeholder'); if(placeholder) placeholder.style.display='flex';"
            />
            <div class="logo-placeholder" style="display: none; position: absolute; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; color: ${textSecondary};">
              ${company.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div style="flex: 1; min-width: 0;">
            <h3 style="font-weight: 800; font-size: 18px; margin: 0 0 4px 0; color: ${textColor}; line-height: 1.2; word-wrap: break-word;">${company.name}</h3>
            <p style="font-size: 13px; color: ${textSecondary}; margin: 0; line-height: 1.3;">${company.sector}</p>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0;">
          ${techTags}
          ${moreTechsBadge}
        </div>
      </div>
      <button
        onclick="window.location.href='/компания/${company.id}'"
        style="position: absolute; top: 0; right: -1px; bottom: 0; width: 49px; padding-left: 12px; padding-right: 12px; background-color: #1D4ED8; color: #ffffff; border: none; border-radius: 0 12px 12px 0; font-weight: 700; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; margin: 0;"
        onmouseover="this.style.backgroundColor='#164bc2'"
        onmouseout="this.style.backgroundColor='#1D4ED8'"
      >
        <img src="/arrowright2.png" alt="→" style="width: auto; height: auto; max-width: 24px; max-height: 24px; display: block;" />
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

        const popup = new Popup({
          closeButton: false,
          maxWidth: '320px',
          className: isDark.value ? 'dark-popup' : 'light-popup'
        }).setHTML(createPopupContent(company))

        const marker = new Marker({ color: '#1D4ED8', anchor: 'bottom' })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(map.value)

        markers.push(marker)
      }
    })
  }

  // Область отображения
  if (!store.selectedCity) {
    map.value.setCenter(defaultCenter)
    map.value.setZoom(defaultZoom)
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
        map.value.fitBounds([sw, ne], { padding: 40, maxZoom: 14 })
      } else {
        const avgLng = cityCoords.reduce((s, c) => s + c[0], 0) / cityCoords.length
        const avgLat = cityCoords.reduce((s, c) => s + c[1], 0) / cityCoords.length
        map.value.setCenter([avgLng, avgLat])
        map.value.setZoom(12)
      }
    } else {
      map.value.setCenter(defaultCenter)
      map.value.setZoom(defaultZoom)
    }
  }
}

onMounted(() => {
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
      map.value?.resize()
      updateMarkers()
    }, 100)
  })

  resizeObserver = new ResizeObserver(() => {
    map.value?.resize()
  })
  resizeObserver.observe(mapContainer.value)

  const handleResize = () => map.value?.resize()
  window.addEventListener('resize', handleResize)
  if (map.value) map.value._resizeHandler = handleResize
})

watch(filteredCompanies, () => updateMarkers(), { deep: true })

watch(
  [isDark, () => store.selectedTechnologies],
  () => {
    updateMarkers()
    setTimeout(() => map.value?.resize(), 100)
  },
  { deep: true }
)

onUnmounted(() => {
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

:deep(.maplibregl-popup-content),
:deep(.maptiler-popup-content) {
  padding: 0;
  margin: 0;
}
:deep(.maplibregl-popup-content-wrapper),
:deep(.maptiler-popup-content-wrapper) {
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.dark :deep(.maplibregl-popup-content-wrapper),
.dark :deep(.maptiler-popup-content-wrapper) {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}
:deep(.maplibregl-popup-tip),
:deep(.maptiler-popup-tip) {
  display: none;
}
:deep(.maplibregl-popup-close-button),
:deep(.maptiler-popup-close-button) {
  display: none;
}
</style>
