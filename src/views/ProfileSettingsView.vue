<template>
  <div class="grid gap-10 lg:gap-12 xl:gap-16 lg:grid-cols-2 lg:items-start">
    <section class="min-w-0">
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Как вас показывать в откликах
      </h2>
      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed">
        Если указать имя и фамилию, они появятся в опубликованных откликах. Иначе будет подпись «Аноним».
      </p>
      <form class="flex flex-col gap-4 max-w-xl" @submit.prevent="saveProfile">
        <div class="grid gap-4 sm:grid-cols-2 sm:gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Имя</label>
            <input
              v-model="profileFirstName"
              type="text"
              autocomplete="given-name"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
              maxlength="120"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Фамилия</label>
            <input
              v-model="profileLastName"
              type="text"
              autocomplete="family-name"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
              maxlength="120"
            />
          </div>
        </div>
        <p v-if="profileMessage" class="text-green-700 dark:text-green-400 text-sm">{{ profileMessage }}</p>
        <p v-if="profileError" class="text-red-600 dark:text-red-400 text-sm">{{ profileError }}</p>
        <button
          type="submit"
          :disabled="profilePending"
          class="self-start px-6 py-2.5 bg-[#1D4ED8] text-white font-medium rounded-lg hover:bg-[#164bc2] disabled:opacity-50"
        >
          {{ profilePending ? 'Сохранение…' : 'Сохранить имя и фамилию' }}
        </button>
      </form>

      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-600 max-w-xl">
        <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">Резюме</h3>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 max-w-2xl leading-relaxed">
          PDF или Word до 5 МБ. Можно заменить файл, загрузив новый.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            ref="resumeInputRef"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            class="sr-only"
            @change="onResumePick"
          />
          <button
            type="button"
            class="self-start px-6 py-2.5 font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="resumeInputRef?.click()"
          >
            Выбрать файл
          </button>
          <button
            type="button"
            :disabled="!resumeFile || resumeUploading"
            class="self-start px-6 py-2.5 bg-[#1D4ED8] text-white font-medium rounded-lg hover:bg-[#164bc2] disabled:opacity-50"
            @click="submitResume"
          >
            {{ resumeUploading ? 'Загрузка…' : 'Загрузить резюме' }}
          </button>
        </div>
        <p v-if="resumeFileName" class="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Выбрано: {{ resumeFileName }}
        </p>
        <p
          v-if="auth.user?.hasResume && auth.user?.resumeOriginalName"
          class="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed"
        >
          <span class="font-medium">Сейчас:</span>
          {{ auth.user.resumeOriginalName }}
          <span v-if="resumeUploadedLabel"> · {{ resumeUploadedLabel }}</span>
        </p>
        <div v-if="auth.user?.hasResume" class="flex flex-wrap gap-3 mt-3">
          <button
            type="button"
            class="text-sm text-[#1D4ED8] underline hover:text-[#164bc2]"
            @click="downloadResume"
          >
            Скачать
          </button>
          <button
            type="button"
            :disabled="resumeDeleting"
            class="text-sm text-red-600 dark:text-red-400 underline hover:opacity-80 disabled:opacity-50"
            @click="removeResume"
          >
            {{ resumeDeleting ? 'Удаление…' : 'Удалить файл' }}
          </button>
        </div>
        <p v-if="resumeMessage" class="text-green-700 dark:text-green-400 text-sm mt-2">{{ resumeMessage }}</p>
        <p v-if="resumeError" class="text-red-600 dark:text-red-400 text-sm mt-2">{{ resumeError }}</p>
      </div>
    </section>

    <section class="min-w-0">
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">Смена пароля</h2>
      <form class="flex flex-col gap-4 max-w-xl" @submit.prevent="changePwd">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Текущий пароль</label>
          <input
            v-model="currentPassword"
            type="password"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          />
          <p v-if="pwdErrors.currentPassword" class="text-red-600 dark:text-red-400 text-sm mt-1">
            {{ pwdErrors.currentPassword }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Новый пароль</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          />
          <p v-if="pwdErrors.password" class="text-red-600 dark:text-red-400 text-sm mt-1">{{ pwdErrors.password }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Повтор нового пароля</label>
          <input
            v-model="newPasswordConfirm"
            type="password"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          />
          <p v-if="pwdErrors.passwordConfirm" class="text-red-600 dark:text-red-400 text-sm mt-1">
            {{ pwdErrors.passwordConfirm }}
          </p>
        </div>
        <p v-if="pwdMessage" class="text-green-700 dark:text-green-400 text-sm">{{ pwdMessage }}</p>
        <p v-if="pwdFormError" class="text-red-600 dark:text-red-400 text-sm">{{ pwdFormError }}</p>
        <button
          type="submit"
          :disabled="pwdPending"
          class="self-start px-6 py-2.5 bg-[#212121] dark:bg-gray-200 dark:text-gray-900 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {{ pwdPending ? 'Сохранение…' : 'Обновить пароль' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { changePasswordFormSchema } from '../validation/authSchema'
import { apiBase, getStoredToken } from '../api/client'

const auth = useAuthStore()
const resumeInputRef = ref(null)
const resumeFile = ref(null)
const resumeFileName = ref('')
const resumeUploading = ref(false)
const resumeDeleting = ref(false)
const resumeMessage = ref('')
const resumeError = ref('')

const resumeUploadedLabel = computed(() => {
  const d = auth.user?.resumeUploadedAt
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
})

function onResumePick(e) {
  const f = e.target.files?.[0]
  resumeFile.value = f || null
  resumeFileName.value = f?.name ?? ''
  resumeError.value = ''
  resumeMessage.value = ''
}

async function submitResume() {
  if (!resumeFile.value) return
  resumeMessage.value = ''
  resumeError.value = ''
  resumeUploading.value = true
  try {
    await auth.uploadResume(resumeFile.value)
    resumeMessage.value = 'Резюме загружено'
    resumeFile.value = null
    resumeFileName.value = ''
    if (resumeInputRef.value) resumeInputRef.value.value = ''
  } catch (e) {
    resumeError.value = e.message || 'Не удалось загрузить'
  } finally {
    resumeUploading.value = false
  }
}

async function downloadResume() {
  resumeError.value = ''
  try {
    const res = await fetch(`${apiBase}/api/profile/resume/file`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` },
    })
    if (!res.ok) {
      const t = await res.text()
      let err = 'Не удалось скачать'
      try {
        err = JSON.parse(t).error || err
      } catch {
        /* empty */
      }
      throw new Error(err)
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = auth.user?.resumeOriginalName || 'resume.pdf'
    a.rel = 'noopener'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    resumeError.value = e.message || 'Не удалось скачать'
  }
}

async function removeResume() {
  resumeMessage.value = ''
  resumeError.value = ''
  resumeDeleting.value = true
  try {
    await auth.deleteResume()
    resumeMessage.value = 'Резюме удалено'
  } catch (e) {
    resumeError.value = e.message || 'Не удалось удалить'
  } finally {
    resumeDeleting.value = false
  }
}
const profileFirstName = ref('')
const profileLastName = ref('')
const profileMessage = ref('')
const profileError = ref('')
const profilePending = ref(false)

watch(
  () => auth.user,
  (u) => {
    if (u) {
      profileFirstName.value = u.firstName ?? ''
      profileLastName.value = u.lastName ?? ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  auth.fetchMe()
})

async function saveProfile() {
  profileMessage.value = ''
  profileError.value = ''
  profilePending.value = true
  try {
    await auth.updateProfile({
      firstName: profileFirstName.value,
      lastName: profileLastName.value,
    })
    profileMessage.value = 'Сохранено'
  } catch (e) {
    profileError.value = e.message || 'Не удалось сохранить'
  } finally {
    profilePending.value = false
  }
}

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
