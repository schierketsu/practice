<template>
  <div class="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-gray-200 dark:border-white">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'

const mapContainer = ref(null)
let map = null
let markers = []

const store = useCompaniesStore()
const themeStore = useThemeStore()

// Центр карты - Россия
const defaultCenter = [61.5240, 105.3188]
const defaultZoom = 4

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
    return 'background-color: #57D900; color: #000000'
  }
  
  return 'background-color: #7A3FFF; color: #ffffff'
}

function createPopupContent(company) {
  const bgColor = isDark.value ? '#1a1a1a' : '#ffffff'
  const textColor = isDark.value ? '#ffffff' : '#000000'
  const textSecondary = isDark.value ? '#a0a0a0' : '#666666'
  const borderColor = isDark.value ? '#2a2a2a' : '#e5e7eb'
  
  // Получаем первые 3 технологии
  const techsToShow = company.technologies.slice(0, 3)
  const hasMoreTechs = company.technologies.length > 3
  
  // Генерируем теги технологий
  const techTags = techsToShow.map(tech => {
    const isSelected = store.selectedTechnologies.includes(tech)
    const style = getTechStyle(tech, isSelected)
    return `<span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 500; margin-right: 6px; margin-bottom: 6px; ${style}">${tech}</span>`
  }).join('')
  
  const moreTechsBadge = hasMoreTechs 
    ? `<span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; background-color: ${isDark.value ? '#2a2a2a' : '#F3F4F6'}; color: ${isDark.value ? '#ffffff' : '#666666'}">+${company.technologies.length - 3}</span>`
    : ''
  
  return `
    <div style="min-width: 280px; max-width: 320px; font-family: Inter, system-ui, -apple-system, sans-serif; background-color: ${bgColor}; border-radius: 12px; overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid ${borderColor};">
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
        <p style="font-size: 12px; color: ${textSecondary}; margin: 0 0 12px 0; line-height: 1.4;">${company.city}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 12px;">
          ${techTags}
          ${moreTechsBadge}
        </div>
      </div>
      <div style="padding: 12px 16px;">
        <button 
          onclick="window.location.href='/компания/${company.id}'"
          style="width: 100%; padding: 10px 16px; background-color: #57D900; color: #000000; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; transition: background-color 0.2s;"
          onmouseover="this.style.backgroundColor='#4ac000'"
          onmouseout="this.style.backgroundColor='#57D900'"
        >
          Подробнее
        </button>
      </div>
    </div>
  `
}

// Инициализация карты
onMounted(() => {
  if (!mapContainer.value) return

  // Создаем карту
  map = L.map(mapContainer.value, {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: true
  })

  // Добавляем слой Watercolor стиль через Stadia Maps (Stamen Watercolor)
  L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
    attribution: '',
    maxZoom: 16,
    minZoom: 1
  }).addTo(map)

  // Обновляем маркеры при первой загрузке
  updateMarkers()
})

// Обновление маркеров при изменении фильтров
watch(filteredCompanies, () => {
  updateMarkers()
}, { deep: true })

// Обновление маркеров при изменении темы или выбранных технологий
watch([isDark, () => store.selectedTechnologies], () => {
  updateMarkers()
  // Перезагружаем размер карты при изменении темы
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 100)
}, { deep: true })

function updateMarkers() {
  if (!map) return

  // Удаляем старые маркеры
  markers.forEach(marker => {
    map.removeLayer(marker)
  })
  markers = []

  // Добавляем новые маркеры
  filteredCompanies.value.forEach(company => {
    if (company.coordinates && company.coordinates.lat && company.coordinates.lng) {
      const marker = L.marker([company.coordinates.lat, company.coordinates.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })

      // Создаем попап с информацией об организации
      const popupContent = createPopupContent(company)

      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: isDark.value ? 'dark-popup' : 'light-popup'
      })
      marker.addTo(map)
      markers.push(marker)
    }
  })

  // Если есть маркеры, подгоняем границы карты
  if (markers.length > 0) {
    const group = new L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  } else {
    // Если маркеров нет или не выбран город, показываем всю Россию
    if (!store.selectedCity) {
      map.setView(defaultCenter, defaultZoom)
    } else {
      map.setView(defaultCenter, defaultZoom)
    }
  }
}

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
/* Стили для карты */
:deep(.leaflet-container) {
  background-color: #f9fafb;
}

.dark :deep(.leaflet-container) {
  background-color: #1a1a1a;
}

:deep(.leaflet-popup-content-wrapper) {
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

:deep(.leaflet-popup-content) {
  margin: 0;
  padding: 0;
}

.dark :deep(.leaflet-popup-content-wrapper) {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

:deep(.leaflet-popup-tip) {
  background: white;
  border: 1px solid #e5e7eb;
}

.dark :deep(.leaflet-popup-tip) {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
}

:deep(.leaflet-control-attribution) {
  display: none !important;
}
</style>
