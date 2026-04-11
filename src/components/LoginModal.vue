<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      ref="overlayRef"
      class="login-modal-overlay fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      tabindex="-1"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @keyup.escape="close"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 relative"
        @click.stop
      >
        <button
          type="button"
          class="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-800 rounded-lg"
          aria-label="Закрыть"
          @click="close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 id="login-modal-title" class="text-2xl font-bold text-black mb-6 pr-8">Вход</h2>
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
          <button type="button" class="text-[#1D4ED8] underline" @click="goRegister">Регистрация</button>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useBackdropDismiss } from '../composables/useBackdropDismiss'
import { useAuthStore } from '../stores/auth'
import { loginFormSchema } from '../validation/authSchema'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'register'])

const auth = useAuthStore()

const overlayRef = ref(null)
const email = ref('')
const password = ref('')
const fieldErrors = reactive({})
const formError = ref('')
const pending = ref(false)

function resetForm() {
  email.value = ''
  password.value = ''
  formError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
}

function close() {
  emit('update:modelValue', false)
}

const { onBackdropPointerDown, onBackdropPointerUp } = useBackdropDismiss(close)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
      nextTick(() => overlayRef.value?.focus())
    }
  }
)

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
    close()
  } catch (e) {
    formError.value = e.message || 'Ошибка входа'
  } finally {
    pending.value = false
  }
}

function goRegister() {
  close()
  emit('register')
}
</script>
