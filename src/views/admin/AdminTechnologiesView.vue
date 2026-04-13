<template>
  <div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>

    <section class="mb-8 rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-[#1a1a1a]">
      <h2 class="text-base font-semibold mb-3">Новая технология</h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Имя должно совпадать с тем, как оно будет у компании (например, Vue, PHP). Иконку можно загрузить ниже по списку.
        Колонка фильтра на карте (фронтенд / бэкенд) задаётся здесь и в таблице ниже.
      </p>
      <form class="flex flex-wrap gap-2 items-end" @submit.prevent="createTechnology">
        <label class="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span class="text-xs text-gray-500">Название</span>
          <input
            v-model="newTechName"
            class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
            placeholder="Например, Rust"
          />
        </label>
        <label class="flex flex-col gap-1 min-w-[160px]">
          <span class="text-xs text-gray-500">На карте (фильтр)</span>
          <select
            v-model="newTechStack"
            class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a] text-sm"
          >
            <option value="BACKEND">Бэкенд</option>
            <option value="FRONTEND">Фронтенд</option>
          </select>
        </label>
        <button type="submit" class="px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm font-medium shrink-0">
          Добавить в справочник
        </button>
      </form>
    </section>

    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th class="text-left p-3 font-semibold">Иконка</th>
            <th class="text-left p-3 font-semibold">Название</th>
            <th class="text-left p-3 font-semibold">Фильтр на карте</th>
            <th class="text-left p-3 font-semibold">Файл</th>
            <th class="text-left p-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-3 w-16">
              <div class="h-10 w-10 rounded border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="row.url" :src="row.url" :alt="row.name" class="max-h-full max-w-full object-contain" />
                <div v-else class="h-8 w-8 rounded bg-gray-300 dark:bg-gray-600" title="Нет иконки" />
              </div>
            </td>
            <td class="p-3 font-mono text-xs">{{ row.name }}</td>
            <td class="p-3">
              <select
                class="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a] max-w-[140px]"
                :value="row.stackGroup || 'BACKEND'"
                @change="setStackGroup(row.name, $event.target.value)"
              >
                <option value="FRONTEND">Фронтенд</option>
                <option value="BACKEND">Бэкенд</option>
              </select>
            </td>
            <td class="p-3">
              <input
                :ref="(el) => setFileInput(row.name, el)"
                type="file"
                accept="image/*,.svg"
                class="text-xs max-w-[200px]"
              />
            </td>
            <td class="p-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="text-xs px-2 py-1 bg-[#212121] text-white rounded"
                @click="uploadIcon(row.name)"
              >
                Загрузить
              </button>
              <button
                v-if="row.url"
                type="button"
                class="text-xs text-amber-700 dark:text-amber-400 underline"
                @click="removeIconFile(row.name)"
              >
                Сбросить иконку
              </button>
              <button type="button" class="text-xs text-red-600 underline" @click="removeTechnology(row.name)">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="rows.length === 0" class="p-4 text-gray-500 text-sm">Справочник пуст.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import { useCompaniesStore } from '../../stores/companies'

const auth = useAuthStore()
const companiesStore = useCompaniesStore()

const rows = ref([])
const loading = ref(true)
const error = ref('')
const newTechName = ref('')
/** @type {import('vue').Ref<'FRONTEND' | 'BACKEND'>} */
const newTechStack = ref('BACKEND')
const fileInputs = ref(new Map())

function setFileInput(name, el) {
  if (el) fileInputs.value.set(name, el)
  else fileInputs.value.delete(name)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiFetch('/api/admin/technology-icons', { token: auth.token })
    rows.value = data.icons || []
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки'
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function createTechnology() {
  error.value = ''
  const name = newTechName.value.trim()
  if (!name) return
  try {
    await apiFetch('/api/admin/technologies', {
      method: 'POST',
      body: { name, stackGroup: newTechStack.value },
      token: auth.token,
    })
    newTechName.value = ''
    newTechStack.value = 'BACKEND'
    await load()
    await companiesStore.fetchTechnologyIcons()
  } catch (e) {
    error.value = e.message || 'Не удалось создать'
  }
}

async function setStackGroup(name, stackGroup) {
  error.value = ''
  try {
    await apiFetch('/api/admin/technologies/stack-group', {
      method: 'PATCH',
      body: { name, stackGroup },
      token: auth.token,
    })
    await load()
    await companiesStore.fetchTechnologyIcons()
  } catch (e) {
    error.value = e.message || 'Не удалось сохранить группу'
    await load()
  }
}

async function uploadIcon(name) {
  error.value = ''
  const input = fileInputs.value.get(name)
  const file = input?.files?.[0]
  if (!file) {
    error.value = 'Выберите файл'
    return
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('name', name)
  try {
    await apiFetch('/api/admin/uploads/tech-icon', { method: 'POST', body: fd, token: auth.token })
    if (input) input.value = ''
    await load()
    await companiesStore.fetchTechnologyIcons()
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки'
  }
}

async function removeIconFile(name) {
  if (!confirm(`Убрать файл иконки у «${name}»? (запись в справочнике останется)`)) return
  error.value = ''
  try {
    await apiFetch(`/api/admin/technology-icons?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
      token: auth.token,
    })
    await load()
    await companiesStore.fetchTechnologyIcons()
  } catch (e) {
    error.value = e.message || 'Не удалось сбросить иконку'
  }
}

async function removeTechnology(name) {
  if (!confirm(`Удалить технологию «${name}» из справочника?`)) return
  error.value = ''
  try {
    await apiFetch(`/api/admin/technologies?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
      token: auth.token,
    })
    await load()
    await companiesStore.fetchTechnologyIcons()
  } catch (e) {
    error.value = e.message || 'Не удалось удалить'
  }
}

onMounted(load)
</script>
