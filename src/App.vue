<template>
  <div class="min-h-screen min-h-[100dvh] bg-[#F9FAFB] flex flex-col overflow-x-hidden">
    <header class="bg-[#F9FAFB]">
      <div
        class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
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
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base whitespace-nowrap"
              @click="returnFromProfile"
            >
              <span class="hidden sm:inline">вернуться</span>
              <span class="sm:hidden">назад</span>
            </button>
            <button
              v-if="!auth.isAuthenticated"
              type="button"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base whitespace-nowrap"
              @click="loginModalOpen = true"
            >
              вход
            </button>
          </div>
          <div
            v-if="showPracticesNavLink"
            class="flex items-center gap-2 sm:gap-3 flex-wrap"
          >
            <router-link
              to="/практики"
              class="header-btn px-2 py-1.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-base inline-block no-underline whitespace-nowrap"
            >
              практики
            </router-link>
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

const PROFILE_HEADER_RETURN_KEY = 'profileHeaderReturn'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const loginModalOpen = ref(false)
const registerModalOpen = ref(false)

const isProfileRoute = computed(() => route.path.startsWith('/профиль'))
/** Ссылка «практики» справа — не на главной со списком компаний */
const showPracticesNavLink = computed(() => route.name !== 'home')

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

