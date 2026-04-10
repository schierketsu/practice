<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
    <header class="mb-8 sm:mb-10 lg:mb-12 pb-6 sm:pb-8">
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Профиль</h1>
        <button
          type="button"
          class="shrink-0 p-0 rounded-none border-0 bg-transparent shadow-none cursor-pointer hover:opacity-80 transition-opacity focus:outline-none -mt-0.5 sm:mt-0"
          aria-label="Выйти"
          @click="logoutAndLeave"
        >
          <img :src="exitIcon" alt="" class="w-7 h-7 sm:w-8 sm:h-8 object-contain block" width="32" height="32" />
        </button>
      </div>
      <p v-if="auth.user" class="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300">
        {{ auth.user.email }}
        <span v-if="auth.isAdmin" class="ml-2 text-xs align-middle bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
          ADMIN
        </span>
      </p>
    </header>

    <nav v-if="auth.isAdmin" class="flex flex-wrap gap-2 mb-6">
      <router-link
        v-for="l in adminLinks"
        :key="l.to"
        :to="l.to"
        class="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-white hover:border-[#212121] dark:hover:border-gray-300"
        active-class="!border-[#212121] dark:!border-gray-300 bg-gray-50 dark:bg-gray-800"
      >
        {{ l.label }}
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

const adminLinks = [
  { to: '/профиль/пользователи', label: 'Пользователи' },
  { to: '/профиль/компании', label: 'Компании' },
  { to: '/профиль/отклики', label: 'Отклики' },
]

function logoutAndLeave() {
  auth.logout()
  router.push('/практики')
}
</script>
