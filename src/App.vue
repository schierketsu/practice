<template>
  <div class="min-h-screen min-h-[100dvh] bg-[#F9FAFB] flex flex-col overflow-x-hidden">
    <header class="bg-[#F9FAFB]">
      <div
        class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              v-if="companyFromSearchUi"
              type="button"
              class="header-btn group px-2 py-2 sm:px-4 sm:py-3 font-bold text-xs sm:text-base whitespace-nowrap inline-flex items-center justify-center"
              aria-label="Назад к списку организаций"
              @click="returnFromCompanySearch"
            >
              <span class="relative inline-flex h-5 w-8 sm:h-6 sm:w-9 shrink-0 items-center justify-center pointer-events-none">
                <img
                  src="/backwhite.png"
                  alt=""
                  class="h-5 w-auto sm:h-6 max-h-[1.75rem] object-contain object-center"
                />
                <img
                  src="/back.png"
                  alt=""
                  class="absolute inset-0 m-auto h-5 w-auto sm:h-6 max-h-[1.75rem] object-contain object-center opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                />
              </span>
            </button>
            <router-link
              v-if="auth.isAuthenticated && !isProfileRoute"
              to="/профиль"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base inline-block no-underline whitespace-nowrap"
              @click="saveProfileReturnPath"
            >
              <span class="hidden sm:inline">мой профиль</span>
              <span class="sm:hidden">профиль</span>
            </router-link>
            <button
              v-else-if="auth.isAuthenticated && isProfileRoute"
              type="button"
              class="header-btn group px-2 py-2 sm:px-4 sm:py-3 font-bold text-xs sm:text-base whitespace-nowrap inline-flex items-center justify-center"
              aria-label="Вернуться назад"
              @click="returnFromProfile"
            >
              <span class="relative inline-flex h-5 w-8 sm:h-6 sm:w-9 shrink-0 items-center justify-center pointer-events-none">
                <img
                  src="/backwhite.png"
                  alt=""
                  class="h-5 w-auto sm:h-6 max-h-[1.75rem] object-contain object-center"
                />
                <img
                  src="/back.png"
                  alt=""
                  class="absolute inset-0 m-auto h-5 w-auto sm:h-6 max-h-[1.75rem] object-contain object-center opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                />
              </span>
            </button>
            <button
              v-if="!auth.isAuthenticated"
              type="button"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base whitespace-nowrap"
              @click="loginModalOpen = true"
            >
              вход
            </button>
            <router-link
              v-if="showPracticesNavLink"
              to="/практики"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base inline-block no-underline whitespace-nowrap shrink-0"
            >
              практики
            </router-link>
          </div>
          <div
            class="hidden sm:flex items-center gap-2 sm:gap-4 flex-wrap justify-end max-w-full"
          >
            <p
              class="m-0 text-right text-sm text-gray-600 leading-snug max-w-none"
            >
              По вопросам и предложениям:
              <a
                href="mailto:info@studprakt.ru"
                class="text-[#1d4ed8] font-medium underline-offset-2 hover:underline break-all sm:break-normal"
              >info@studprakt.ru</a>
            </p>
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1 min-w-0 overflow-x-hidden">
      <RouterView />
    </main>
    <Footer />
    <LoginModal v-model="loginModalOpen" @register="switchToRegister" />
    <RegisterModal v-model="registerModalOpen" @open-login="switchToLogin" />
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Footer from './components/Footer.vue'
import LoginModal from './components/LoginModal.vue'
import RegisterModal from './components/RegisterModal.vue'
import { useAuthStore } from './stores/auth'
import {
  PROFILE_HEADER_RETURN_KEY,
  COMPANY_SEARCH_RETURN_KEY,
} from './lib/navigationKeys'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const loginModalOpen = ref(false)
const registerModalOpen = ref(false)

const isProfileRoute = computed(() => route.path.startsWith('/профиль'))

/** Карточка компании после перехода с главной практик (поиск / карта). */
const companyFromSearchUi = computed(() => {
  if (route.name !== 'company-detail') return false
  if (typeof sessionStorage === 'undefined') return false
  return !!sessionStorage.getItem(COMPANY_SEARCH_RETURN_KEY)
})

/** Путь, с которого зашли в профиль (для кнопки «назад»). */
function getProfileReturnPath() {
  if (typeof sessionStorage === 'undefined') return ''
  return sessionStorage.getItem(PROFILE_HEADER_RETURN_KEY) || ''
}

/** Страница списка практик (главная карта/список). */
function pathIsPracticesHome(fullPath) {
  if (!fullPath || typeof fullPath !== 'string') return false
  let p = fullPath.trim().split('?')[0].split('#')[0]
  try {
    p = decodeURIComponent(p)
  } catch {
    /* оставляем как есть */
  }
  return p === '/практики' || p === '/'
}

/**
 * Ссылка «практики» — не на главной практик.
 * На профиле с `/практики` и на компании после поиска с главной — без дублирующей «практики».
 */
const showPracticesNavLink = computed(() => {
  if (route.name === 'home') return false
  if (companyFromSearchUi.value) return false
  if (isProfileRoute.value && pathIsPracticesHome(getProfileReturnPath())) return false
  return true
})

function saveProfileReturnPath() {
  if (!route.path.startsWith('/профиль')) {
    sessionStorage.setItem(PROFILE_HEADER_RETURN_KEY, route.fullPath)
  }
}

function returnFromProfile() {
  const target = sessionStorage.getItem(PROFILE_HEADER_RETURN_KEY)
  sessionStorage.removeItem(PROFILE_HEADER_RETURN_KEY)
  if (target) {
    router.push(target)
  } else {
    router.push('/практики')
  }
}

function returnFromCompanySearch() {
  const target = sessionStorage.getItem(COMPANY_SEARCH_RETURN_KEY) || '/практики'
  sessionStorage.removeItem(COMPANY_SEARCH_RETURN_KEY)
  router.push(target)
}

function switchToRegister() {
  loginModalOpen.value = false
  registerModalOpen.value = true
}

function switchToLogin() {
  registerModalOpen.value = false
  loginModalOpen.value = true
}

provide('openRegisterModal', () => {
  registerModalOpen.value = true
})
</script>

<style scoped>
/* Синий фон, белый текст. Hover: белый фон (вместо голубого), тёмный текст, тень как раньше. */
.header-btn {
  font-family: 'Polonium', serif;
  letter-spacing: 0.06em;
  background-color: #1d4ed8;
  color: #fff;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  box-shadow: none;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.header-btn:hover {
  background-color: #fff;
  color: #212121;
  border: 2px solid #212121;
  box-shadow: 5px 5px 0 0 #212121;
}
</style>

