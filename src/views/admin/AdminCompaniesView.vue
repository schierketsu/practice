<template>
  <div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>
    <button
      type="button"
      class="mb-4 px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm font-medium"
      @click="openCreate"
    >
      Добавить компанию
    </button>
    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left p-3 font-semibold">ID</th>
            <th class="text-left p-3 font-semibold">Название</th>
            <th class="text-left p-3 font-semibold">Город</th>
            <th class="text-left p-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in companies" :key="c.id" class="border-b border-gray-100">
            <td class="p-3">{{ c.id }}</td>
            <td class="p-3">{{ c.name }}</td>
            <td class="p-3">{{ c.city }}</td>
            <td class="p-3 flex gap-2">
              <button type="button" class="text-[#1D4ED8] underline" @click="openEdit(c)">Изменить</button>
              <button type="button" class="text-red-600 underline" @click="remove(c)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="modal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000] p-4"
      @click.self="modal = null"
    >
      <div class="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <h2 class="text-lg font-bold mb-4">{{ editingId ? 'Редактирование' : 'Новая компания' }}</h2>
        <form class="flex flex-col gap-2 text-sm" @submit.prevent="saveCompany">
          <label>Название <input v-model="form.name" required class="w-full border rounded px-2 py-1" /></label>
          <label>Logo URL <input v-model="form.logo" required class="w-full border rounded px-2 py-1" /></label>
          <label>Описание <textarea v-model="form.description" required rows="3" class="w-full border rounded px-2 py-1" /></label>
          <label>Технологии (через запятую) <input v-model="techStr" required class="w-full border rounded px-2 py-1" /></label>
          <label>Сектор <input v-model="form.sector" required class="w-full border rounded px-2 py-1" /></label>
          <label>Контакты <input v-model="form.contacts" required class="w-full border rounded px-2 py-1" /></label>
          <label>Город <input v-model="form.city" required class="w-full border rounded px-2 py-1" /></label>
          <label>Вуз <input v-model="form.university" required class="w-full border rounded px-2 py-1" /></label>
          <label>Факультет <input v-model="form.faculty" required class="w-full border rounded px-2 py-1" /></label>
          <label>Широта <input v-model.number="form.lat" type="number" step="any" required class="w-full border rounded px-2 py-1" /></label>
          <label>Долгота <input v-model.number="form.lng" type="number" step="any" required class="w-full border rounded px-2 py-1" /></label>
          <p v-if="saveError" class="text-red-600">{{ saveError }}</p>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="flex-1 py-2 bg-[#212121] text-white rounded">Сохранить</button>
            <button type="button" class="px-4 py-2 border rounded" @click="modal = null">Отмена</button>
          </div>
        </form>
      </div>
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
const companies = ref([])
const loading = ref(true)
const error = ref('')
const modal = ref(null)
const editingId = ref(null)
const saveError = ref('')
const techStr = ref('')

const form = reactive({
  name: '',
  logo: '/bokus.jpg',
  description: '',
  sector: '',
  contacts: '',
  city: 'Чебоксары',
  university: '',
  faculty: '',
  lat: 56.15,
  lng: 47.2,
})

function formFromCompany(c) {
  form.name = c.name
  form.logo = c.logo
  form.description = c.description
  form.sector = c.sector
  form.contacts = c.contacts
  form.city = c.city
  form.university = c.university
  form.faculty = c.faculty
  form.lat = c.coordinates?.lat ?? c.lat
  form.lng = c.coordinates?.lng ?? c.lng
  techStr.value = (c.technologies || []).join(', ')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiFetch('/api/admin/companies', { token: auth.token })
    companies.value = data.companies
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    name: '',
    logo: '/bokus.jpg',
    description: '',
    sector: '',
    contacts: '',
    city: 'Чебоксары',
    university: 'ЧУВГУ ИМ. И. Н. УЛЬЯНОВА',
    faculty: 'факультет ИВТ',
    lat: 56.15,
    lng: 47.2,
  })
  techStr.value = 'Vue'
  saveError.value = ''
  modal.value = true
}

function openEdit(c) {
  editingId.value = c.id
  formFromCompany(c)
  saveError.value = ''
  modal.value = true
}

async function saveCompany() {
  saveError.value = ''
  const technologies = techStr.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const body = {
    ...form,
    technologies,
  }
  try {
    if (editingId.value) {
      await apiFetch(`/api/admin/companies/${editingId.value}`, {
        method: 'PUT',
        body,
        token: auth.token,
      })
    } else {
      await apiFetch('/api/admin/companies', {
        method: 'POST',
        body,
        token: auth.token,
      })
    }
    modal.value = null
    await load()
    await companiesStore.fetchCompanies()
  } catch (e) {
    saveError.value = e.message || 'Ошибка сохранения'
  }
}

async function remove(c) {
  if (!confirm(`Удалить «${c.name}»?`)) return
  try {
    await apiFetch(`/api/admin/companies/${c.id}`, { method: 'DELETE', token: auth.token })
    await load()
    await companiesStore.fetchCompanies()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>
