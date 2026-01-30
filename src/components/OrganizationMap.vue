<template>
  <div class="w-full h-full min-h-[400px] sm:min-h-[500px] rounded-lg overflow-hidden border-l border-t border-b border-gray-200 dark:border-white" style="border-right: none;">
    <div ref="mapContainer" class="w-full h-full min-h-[400px] sm:min-h-[500px]"></div>
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
let resizeObserver = null

const store = useCompaniesStore()
const themeStore = useThemeStore()

// Центр карты - Европейская часть России
const defaultCenter = [55.5, 40.0]
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

function createCustomMarkerIcon(color = '#1D4ED8') {
  // Создаем классический маркер-булавку фиолетового цвета (широкий)
  const svg = `<svg width="30" height="41" viewBox="0 0 30 41" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0 C22.2 0, 30 6.8, 30 15 C30 24, 15 41, 15 41 C15 41, 0 24, 0 15 C0 6.8, 7.8 0, 15 0 Z" 
          fill="${color}"/>
    <circle cx="15" cy="15" r="7" fill="white"/>
  </svg>`
  
  // Используем data URI для SVG
  const encodedSvg = encodeURIComponent(svg)
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodedSvg}`
  
  return L.icon({
    iconUrl: dataUri,
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [0, -35]
  })
}

function createPopupContent(company) {
  const bgColor = isDark.value ? '#1a1a1a' : '#ffffff'
  const textColor = isDark.value ? '#ffffff' : '#000000'
  const textSecondary = isDark.value ? '#a0a0a0' : '#666666'
  const borderColor = isDark.value ? '#2a2a2a' : '#e5e7eb'
  
  // Получаем первые 2 технологии
  const techsToShow = company.technologies.slice(0, 2)
  const hasMoreTechs = company.technologies.length > 2
  
  // Генерируем теги технологий
  const techTags = techsToShow.map(tech => {
    const isSelected = store.selectedTechnologies.includes(tech)
    const style = getTechStyle(tech, isSelected)
    return `<span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 500; margin-right: 6px; margin-bottom: 6px; line-height: 1; ${style}">${tech}</span>`
  }).join('')
  
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

// Инициализация карты
onMounted(() => {
  if (!mapContainer.value) return

  // Создаем карту сразу, без лишних проверок
  map = L.map(mapContainer.value, {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: true
  })

  // Добавляем слой OpenStreetMap (стандартный провайдер, работает без API ключа)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 19,
    minZoom: 1,
    subdomains: ['a', 'b', 'c']
  }).addTo(map)

  // Обновляем размеры и маркеры после небольшой задержки для применения стилей
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
      updateMarkers()
    }
  }, 100)

  // Добавляем ResizeObserver для отслеживания изменений размера контейнера
  if (mapContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (map) {
        map.invalidateSize()
      }
    })
    resizeObserver.observe(mapContainer.value)
  }

  // Обработчик изменения размера окна
  const handleResize = () => {
    if (map) {
      map.invalidateSize()
    }
  }
  window.addEventListener('resize', handleResize)
  
  // Сохраняем обработчик для очистки
  map._resizeHandler = handleResize
})

// Обновление маркеров при изменении фильтров
watch(filteredCompanies, () => {
  updateMarkers()
}, { deep: true })

// Функция для обновления стилей tip
function updateTipStyles() {
  const tips = document.querySelectorAll('.leaflet-popup-tip')
  tips.forEach(tip => {
    if (isDark.value) {
      tip.style.setProperty('background', '#1a1a1a', 'important')
      tip.style.setProperty('border-color', '#2a2a2a', 'important')
    } else {
      tip.style.setProperty('background', 'white', 'important')
      tip.style.setProperty('border-color', '#e5e7eb', 'important')
    }
  })
}

// Обновление маркеров при изменении темы или выбранных технологий
watch([isDark, () => store.selectedTechnologies], () => {
  updateMarkers()
  // Обновляем стили tip для открытых попапов
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
      updateTipStyles()
      // Повторно обновляем через небольшую задержку для надежности
      setTimeout(updateTipStyles, 50)
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

  // Добавляем маркеры только если выбран факультет
  if (store.selectedFaculty) {
    filteredCompanies.value.forEach((company) => {
      if (company.coordinates && company.coordinates.lat && company.coordinates.lng) {
        // Все маркеры фиолетовые
        const markerColor = '#1D4ED8'
        const marker = L.marker([company.coordinates.lat, company.coordinates.lng], {
          icon: createCustomMarkerIcon(markerColor)
        })

        // Создаем попап с информацией об организации
        const popupContent = createPopupContent(company)

        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: isDark.value ? 'dark-popup' : 'light-popup',
          autoPan: true
        })
        
        // Обновляем стили tip при открытии попапа
        marker.on('popupopen', () => {
          setTimeout(() => {
            updateTipStyles()
          }, 10)
        })
        
        marker.addTo(map)
        markers.push(marker)
      }
    })
  }

  // Определяем область отображения карты
  if (!store.selectedCity) {
    // Если выбран "все города", показываем европейскую часть России
    map.setView(defaultCenter, defaultZoom)
  } else {
    // Если выбран конкретный город
    const cityCompanies = store.companies.filter(company => company.city === store.selectedCity)
    const cityCoordinates = cityCompanies
      .filter(company => company.coordinates && company.coordinates.lat && company.coordinates.lng)
      .map(company => [company.coordinates.lat, company.coordinates.lng])
    
    if (cityCoordinates.length > 0) {
      if (markers.length > 0) {
        // Если есть маркеры, подгоняем границы карты под них
        const group = new L.featureGroup(markers)
        map.fitBounds(group.getBounds().pad(0.1))
      } else {
        // Если маркеров нет, но есть координаты компаний в городе, приближаем к городу
        const avgLat = cityCoordinates.reduce((sum, coord) => sum + coord[0], 0) / cityCoordinates.length
        const avgLng = cityCoordinates.reduce((sum, coord) => sum + coord[1], 0) / cityCoordinates.length
        map.setView([avgLat, avgLng], 12)
      }
    } else {
      // Если координат нет, показываем европейскую часть России
      map.setView(defaultCenter, defaultZoom)
    }
  }
}

onUnmounted(() => {
  // Удаляем ResizeObserver
  if (resizeObserver && mapContainer.value) {
    resizeObserver.unobserve(mapContainer.value)
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // Удаляем обработчик изменения размера окна
  if (map && map._resizeHandler) {
    window.removeEventListener('resize', map._resizeHandler)
  }

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
  border-radius: 4px;
  transition: background-color 0.2s, border-color 0.2s;
}

:deep(.dark .leaflet-popup-tip),
.dark :deep(.leaflet-popup-tip) {
  background: #1a1a1a !important;
  border: 1px solid #2a2a2a !important;
  border-radius: 4px;
}

:deep(.leaflet-control-attribution) {
  display: none !important;
}

:deep(.leaflet-popup-close-button) {
  display: none !important;
}

/* Стили для кнопки в попапе, чтобы убрать белую линию */
:deep(.leaflet-popup-content-wrapper .leaflet-popup-content > div > button) {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
  z-index: 10 !important;
}
</style>
