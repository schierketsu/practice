<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
      <h1 class="text-2xl font-bold text-black mb-6">Вход</h1>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p v-if="fieldErrors.email" class="text-red-600 text-sm mt-1">{{ fieldErrors.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p v-if="fieldErrors.password" class="text-red-600 text-sm mt-1">{{ fieldErrors.password }}</p>
        </div>
        <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>
        <button
          type="submit"
          :disabled="pending"
          class="w-full py-3 bg-[#1D4ED8] text-white font-semibold rounded-lg hover:bg-[#164bc2] disabled:opacity-50"
        >
          {{ pending ? 'Вход…' : 'Войти' }}
        </button>
      </form>
      <p class="mt-4 text-sm text-gray-600 text-center">
        Нет аккаунта?
        <router-link to="/регистрация" class="text-[#1D4ED8] underline">Регистрация</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { loginFormSchema } from '../validation/authSchema'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const fieldErrors = reactive({})
const formError = ref('')
const pending = ref(false)

async function submit() {
  formError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  const parsed = loginFormSchema.safeParse({ email: email.value, password: password.value })
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    if (f.email?.[0]) fieldErrors.email = f.email[0]
    if (f.password?.[0]) fieldErrors.password = f.password[0]
    return
  }
  pending.value = true
  try {
    await auth.login(parsed.data.email, parsed.data.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/практики'
    router.push(redirect || '/практики')
  } catch (e) {
    formError.value = e.message || 'Ошибка входа'
  } finally {
    pending.value = false
  }
}
</script>
