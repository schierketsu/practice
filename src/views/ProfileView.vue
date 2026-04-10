<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
    <div class="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
      <h1 class="text-2xl font-bold text-black mb-2">Профиль</h1>
      <p v-if="auth.user" class="text-gray-600 mb-6">
        {{ auth.user.email }}
        <span v-if="auth.isAdmin" class="ml-2 text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">ADMIN</span>
      </p>
      <p class="text-sm text-gray-500 mb-6">Дополнительные поля анкеты можно добавить позже.</p>

      <h2 class="text-lg font-semibold text-black mb-3">Смена пароля</h2>
      <form class="flex flex-col gap-3" @submit.prevent="changePwd">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
          <input
            v-model="currentPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p v-if="pwdErrors.currentPassword" class="text-red-600 text-sm mt-1">{{ pwdErrors.currentPassword }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
          <input v-model="newPassword" type="password" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <p v-if="pwdErrors.password" class="text-red-600 text-sm mt-1">{{ pwdErrors.password }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Повтор нового пароля</label>
          <input
            v-model="newPasswordConfirm"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p v-if="pwdErrors.passwordConfirm" class="text-red-600 text-sm mt-1">{{ pwdErrors.passwordConfirm }}</p>
        </div>
        <p v-if="pwdMessage" class="text-green-700 text-sm">{{ pwdMessage }}</p>
        <p v-if="pwdFormError" class="text-red-600 text-sm">{{ pwdFormError }}</p>
        <button
          type="submit"
          :disabled="pwdPending"
          class="py-2.5 bg-[#212121] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {{ pwdPending ? 'Сохранение…' : 'Обновить пароль' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { changePasswordFormSchema } from '../validation/authSchema'

const auth = useAuthStore()
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const pwdErrors = reactive({})
const pwdFormError = ref('')
const pwdMessage = ref('')
const pwdPending = ref(false)

async function changePwd() {
  pwdMessage.value = ''
  pwdFormError.value = ''
  Object.keys(pwdErrors).forEach((k) => delete pwdErrors[k])
  const parsed = changePasswordFormSchema.safeParse({
    currentPassword: currentPassword.value,
    password: newPassword.value,
    passwordConfirm: newPasswordConfirm.value,
  })
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    if (f.currentPassword?.[0]) pwdErrors.currentPassword = f.currentPassword[0]
    if (f.password?.[0]) pwdErrors.password = f.password[0]
    if (f.passwordConfirm?.[0]) pwdErrors.passwordConfirm = f.passwordConfirm[0]
    return
  }
  pwdPending.value = true
  try {
    await auth.changePassword({
      currentPassword: parsed.data.currentPassword,
      password: parsed.data.password.trim(),
      passwordConfirm: parsed.data.password.trim(),
    })
    pwdMessage.value = 'Пароль обновлён'
    currentPassword.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''
  } catch (e) {
    pwdFormError.value = e.message || 'Не удалось сменить пароль'
  } finally {
    pwdPending.value = false
  }
}
</script>
