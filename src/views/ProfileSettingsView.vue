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
    </section>

    <section class="min-w-0">
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">Резюме</h2>
      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed">
        PDF или Word до 5 МБ. Можно заменить файл, загрузив новый.
      </p>
      <div class="max-w-xl">
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
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
</script>
