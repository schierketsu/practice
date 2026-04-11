<template>
  <div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>

    <section class="mb-8 rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-[#1a1a1a]">
      <h2 class="text-base font-semibold mb-3">Новый вуз</h2>
      <form class="flex flex-wrap gap-2 items-end" @submit.prevent="createUniversity">
        <label class="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span class="text-xs text-gray-500">Название</span>
          <input
            v-model="newUniversityName"
            class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
            placeholder="Например, ЧУВГУ ИМ. И. Н. УЛЬЯНОВА"
          />
        </label>
        <button type="submit" class="px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm font-medium shrink-0">
          Добавить вуз
        </button>
      </form>
    </section>

    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="space-y-6">
      <article
        v-for="u in universities"
        :key="u.id"
        class="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-[#1a1a1a]"
      >
        <div class="flex flex-wrap items-center justify-between gap-2 p-4 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-600">
          <h3 class="font-semibold text-sm sm:text-base pr-2">{{ u.name }}</h3>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-sm text-[#1D4ED8] underline"
              @click="startRenameUniversity(u)"
            >
              Переименовать
            </button>
            <button type="button" class="text-sm text-red-600 underline" @click="removeUniversity(u)">Удалить вуз</button>
          </div>
        </div>

        <div v-if="renameUniversityId === u.id" class="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-2 items-end">
          <label class="flex flex-col gap-1 flex-1 min-w-[180px]">
            <span class="text-xs text-gray-500">Новое название</span>
            <input v-model="renameUniversityValue" class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
          </label>
          <button type="button" class="px-3 py-1.5 bg-[#212121] text-white rounded text-sm" @click="submitRenameUniversity(u.id)">
            Сохранить
          </button>
          <button type="button" class="px-3 py-1.5 border border-gray-300 rounded text-sm" @click="renameUniversityId = null">Отмена</button>
        </div>

        <div class="p-4">
          <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Факультеты</h4>
          <ul v-if="u.faculties?.length" class="space-y-2 mb-4">
            <li
              v-for="f in u.faculties"
              :key="f.id"
              class="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span class="text-sm">{{ f.name }}</span>
              <div class="flex gap-2 shrink-0">
                <button type="button" class="text-xs text-[#1D4ED8] underline" @click="startRenameFaculty(f, u.id)">
                  Переименовать
                </button>
                <button type="button" class="text-xs text-red-600 underline" @click="removeFaculty(f)">Удалить</button>
              </div>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-400 mb-4">Пока нет факультетов</p>

          <div v-if="renameFacultyUniId === u.id && renameFacultyId" class="mb-4 flex flex-wrap gap-2 items-end">
            <label class="flex flex-col gap-1 flex-1 min-w-[160px]">
              <span class="text-xs text-gray-500">Новое название факультета</span>
              <input v-model="renameFacultyValue" class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
            </label>
            <button type="button" class="px-3 py-1.5 bg-[#212121] text-white rounded text-sm" @click="submitRenameFaculty">Сохранить</button>
            <button type="button" class="px-3 py-1.5 border rounded text-sm" @click="cancelRenameFaculty">Отмена</button>
          </div>

          <form class="flex flex-wrap gap-2 items-end" @submit.prevent="createFaculty(u.id)">
            <label class="flex flex-col gap-1 flex-1 min-w-[180px]">
              <span class="text-xs text-gray-500">Новый факультет</span>
              <input
                v-model="newFacultyByUniversity[u.id]"
                class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
                placeholder="Например, факультет ИВТ"
              />
            </label>
            <button type="submit" class="px-3 py-2 bg-gray-800 text-white rounded text-sm shrink-0">Добавить</button>
          </form>
        </div>
      </article>

      <p v-if="universities.length === 0" class="text-gray-500 text-sm">Справочник пуст — добавьте первый вуз.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiFetch } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import { useCompaniesStore } from '../../stores/companies'

const auth = useAuthStore()
const companiesStore = useCompaniesStore()
const universities = ref([])
const loading = ref(true)
const error = ref('')
const newUniversityName = ref('')
const newFacultyByUniversity = reactive({})
const renameUniversityId = ref(null)
const renameUniversityValue = ref('')
const renameFacultyId = ref(null)
const renameFacultyUniId = ref(null)
const renameFacultyValue = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiFetch('/api/admin/universities', { token: auth.token })
    universities.value = data.universities || []
    for (const u of universities.value) {
      if (newFacultyByUniversity[u.id] === undefined) newFacultyByUniversity[u.id] = ''
    }
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки'
    universities.value = []
  } finally {
    loading.value = false
  }
}

async function createUniversity() {
  error.value = ''
  const name = newUniversityName.value.trim()
  if (!name) return
  try {
    await apiFetch('/api/admin/universities', {
      method: 'POST',
      body: { name },
      token: auth.token,
    })
    newUniversityName.value = ''
    await load()
  } catch (e) {
    error.value = e.message || 'Не удалось создать вуз'
  }
}

function startRenameUniversity(u) {
  renameUniversityId.value = u.id
  renameUniversityValue.value = u.name
}

async function submitRenameUniversity(id) {
  error.value = ''
  const name = renameUniversityValue.value.trim()
  if (!name) return
  try {
    await apiFetch(`/api/admin/universities/${id}`, {
      method: 'PATCH',
      body: { name },
      token: auth.token,
    })
    renameUniversityId.value = null
    await load()
    await companiesStore.fetchCompanies()
  } catch (e) {
    error.value = e.message || 'Не удалось сохранить'
  }
}

async function removeUniversity(u) {
  if (!confirm(`Удалить вуз «${u.name}» и все его факультеты?`)) return
  error.value = ''
  try {
    await apiFetch(`/api/admin/universities/${u.id}`, { method: 'DELETE', token: auth.token })
    await load()
  } catch (e) {
    error.value = e.message || 'Не удалось удалить'
  }
}

async function createFaculty(universityId) {
  error.value = ''
  const name = (newFacultyByUniversity[universityId] || '').trim()
  if (!name) return
  try {
    await apiFetch(`/api/admin/universities/${universityId}/faculties`, {
      method: 'POST',
      body: { name },
      token: auth.token,
    })
    newFacultyByUniversity[universityId] = ''
    await load()
  } catch (e) {
    error.value = e.message || 'Не удалось добавить факультет'
  }
}

function startRenameFaculty(f, universityId) {
  renameFacultyId.value = f.id
  renameFacultyUniId.value = universityId
  renameFacultyValue.value = f.name
}

function cancelRenameFaculty() {
  renameFacultyId.value = null
  renameFacultyUniId.value = null
  renameFacultyValue.value = ''
}

async function submitRenameFaculty() {
  error.value = ''
  const id = renameFacultyId.value
  const name = renameFacultyValue.value.trim()
  if (!id || !name) return
  try {
    await apiFetch(`/api/admin/faculties/${id}`, {
      method: 'PATCH',
      body: { name },
      token: auth.token,
    })
    cancelRenameFaculty()
    await load()
    await companiesStore.fetchCompanies()
  } catch (e) {
    error.value = e.message || 'Не удалось сохранить'
  }
}

async function removeFaculty(f) {
  if (!confirm(`Удалить факультет «${f.name}»?`)) return
  error.value = ''
  try {
    await apiFetch(`/api/admin/faculties/${f.id}`, { method: 'DELETE', token: auth.token })
    await load()
  } catch (e) {
    error.value = e.message || 'Не удалось удалить'
  }
}

onMounted(load)
</script>
