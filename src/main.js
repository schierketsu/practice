import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'
import 'leaflet/dist/leaflet.css'
import { installRussianNativeValidity } from './utils/nativeValidityRu'
import faviconUrl from './assets/icons/завод1.png'

const faviconLink = document.createElement('link')
faviconLink.rel = 'icon'
faviconLink.type = 'image/png'
faviconLink.href = faviconUrl
document.head.appendChild(faviconLink)

installRussianNativeValidity()

const pinia = createPinia()

async function boot() {
  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  document.documentElement.classList.remove('dark')
  const auth = useAuthStore()
  await auth.restoreSession()
  app.mount('#app')
}

boot()

