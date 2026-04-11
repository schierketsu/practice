<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      ref="overlayRef"
      class="register-modal-overlay fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      tabindex="-1"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @keyup.escape="close"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
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
        <h2 id="register-modal-title" class="text-2xl font-bold text-black mb-2 pr-8">Регистрация</h2>
        <p class="text-sm text-gray-600 mb-6">
          Впервые? Тогда заполни это.
        </p>
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
              autocomplete="new-password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p v-if="fieldErrors.password" class="text-red-600 text-sm mt-1">{{ fieldErrors.password }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля</label>
            <input
              v-model="passwordConfirm"
              type="password"
              autocomplete="new-password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p v-if="fieldErrors.passwordConfirm" class="text-red-600 text-sm mt-1">{{ fieldErrors.passwordConfirm }}</p>
          </div>
          <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>
          <button
            type="submit"
            :disabled="pending"
            class="w-full py-3 bg-[#1D4ED8] text-white font-semibold rounded-lg hover:bg-[#164bc2] disabled:opacity-50"
          >
            {{ pending ? 'Регистрация…' : 'Зарегистрироваться' }}
          </button>
        </form>
        <p class="mt-4 text-sm text-gray-600 text-center">
          Уже есть аккаунт?
          <button type="button" class="text-[#1D4ED8] underline" @click="goLogin">Вход</button>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useBackdropDismiss } from '../composables/useBackdropDismiss'
import { useAuthStore } from '../stores/auth'
import { registerFormSchema } from '../validation/authSchema'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'open-login'])

const auth = useAuthStore()

const overlayRef = ref(null)
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const fieldErrors = reactive({})
const formError = ref('')
const pending = ref(false)

function resetForm() {
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
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

function applyZodFieldErrors(err) {
  const f = err.flatten().fieldErrors
  if (f.email?.[0]) fieldErrors.email = f.email[0]
  if (f.password?.[0]) fieldErrors.password = f.password[0]
  if (f.passwordConfirm?.[0]) fieldErrors.passwordConfirm = f.passwordConfirm[0]
}

async function submit() {
  formError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  const parsed = registerFormSchema.safeParse({
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value,
  })
  if (!parsed.success) {
    applyZodFieldErrors(parsed.error)
    return
  }
  const pwd = parsed.data.password.trim()
  pending.value = true
  try {
    await auth.register({
      email: parsed.data.email,
      password: pwd,
      passwordConfirm: pwd,
    })
    close()
  } catch (e) {
    if (e.data?.details?.fieldErrors) {
      const fe = e.data.details.fieldErrors
      if (fe.email?.[0]) fieldErrors.email = fe.email[0]
      if (fe.password?.[0]) fieldErrors.password = fe.password[0]
      if (fe.passwordConfirm?.[0]) fieldErrors.passwordConfirm = fe.passwordConfirm[0]
    }
    formError.value = e.message || 'Ошибка регистрации'
  } finally {
    pending.value = false
  }
}

function goLogin() {
  close()
  emit('open-login')
}
</script>
