<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
    <header class="mb-8 sm:mb-10 lg:mb-12 pb-6 sm:pb-8">
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Профиль
        </h1>
        <button
          type="button"
          class="shrink-0 p-0 rounded-none border-0 bg-transparent shadow-none cursor-pointer hover:opacity-80 transition-opacity focus:outline-none -mt-0.5 sm:mt-0"
          aria-label="Выйти"
          @click="logoutAndLeave"
        >
          <img :src="exitIcon" alt="" class="w-7 h-7 sm:w-8 sm:h-8 object-contain block" width="32" height="32" />
        </button>
      </div>
      <p
        v-if="auth.user"
        class="mt-3 text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 break-words"
      >
        {{ auth.user.email }}
        <span v-if="auth.isAdmin" class="ml-2 text-xs align-middle bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
          ADMIN
        </span>
      </p>
    </header>

    <nav v-if="auth.isAdmin" class="flex flex-wrap gap-2 mb-6 -mx-1 px-1 sm:mx-0 sm:px-0">
      <router-link
        v-for="l in adminLinks"
        :key="l.to"
        :to="l.to"
        class="px-3 py-2 sm:px-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-900 dark:text-white hover:border-[#212121] dark:hover:border-gray-300 min-h-[44px] inline-flex items-center gap-2"
        active-class="!border-[#212121] dark:!border-gray-300 bg-gray-50 dark:bg-gray-800"
      >
        <span class="shrink-0 w-5 h-5 text-gray-700 dark:text-gray-200" aria-hidden="true" v-html="l.icon" />
        <span>{{ l.label }}</span>
      </router-link>
    </nav>

    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import exitIcon from '../assets/icons/exit.png'

const auth = useAuthStore()
const router = useRouter()

const iconUsers = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`

const iconBuilding = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4M6 16h4M14 12h4M14 16h4"/><path d="M10 22v-6h4v6"/></svg>`

const iconGraduation = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`

const iconTech = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/><path d="m12 2-2 20"/></svg>`

const iconReviews = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`

const adminLinks = [
  { to: '/профиль/пользователи', label: 'Пользователи', icon: iconUsers },
  { to: '/профиль/компании', label: 'Компании', icon: iconBuilding },
  { to: '/профиль/вузы', label: 'Вузы', icon: iconGraduation },
  { to: '/профиль/технологии', label: 'Технологии', icon: iconTech },
  { to: '/профиль/отклики', label: 'Отклики', icon: iconReviews },
]

function logoutAndLeave() {
  auth.logout()
  router.push('/практики')
}
</script>
