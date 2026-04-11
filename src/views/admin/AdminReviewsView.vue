<template>
  <div>
    <div class="flex flex-wrap gap-3 mb-4">
      <select
        v-model="filterStatus"
        class="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100"
        @change="load"
      >
        <option value="">Все статусы</option>
        <option value="PENDING">PENDING</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
    </div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
      <table class="min-w-full text-sm text-gray-900 dark:text-gray-100">
        <thead class="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th class="text-left p-2 font-semibold">ID</th>
            <th class="text-left p-2 font-semibold">Компания</th>
            <th class="text-left p-2 font-semibold min-w-[200px]">Текст</th>
            <th class="text-left p-2 font-semibold">Автор</th>
            <th class="text-left p-2 font-semibold">Рейтинг</th>
            <th class="text-left p-2 font-semibold">Статус</th>
            <th class="text-left p-2 font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reviews" :key="r.id" class="border-b border-gray-100 dark:border-gray-800 align-top">
            <td class="p-2">
              <button
                type="button"
                class="text-[#1D4ED8] dark:text-blue-400 underline font-mono text-xs sm:text-sm"
                :title="'Редактировать отклик ' + r.id"
                @click="openEdit(r)"
              >
                {{ r.id }}
              </button>
            </td>
            <td class="p-2 max-w-[180px]">{{ r.companyName }}</td>
            <td class="p-2 max-w-md text-gray-600 dark:text-gray-300">
              <span class="line-clamp-3 whitespace-pre-wrap break-words">{{ r.text }}</span>
            </td>
            <td class="p-2">{{ r.authorDisplay }}</td>
            <td class="p-2">{{ r.rating }}</td>
            <td class="p-2">
              <select
                :value="r.status"
                class="border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 max-w-[120px] bg-white dark:bg-[#2a2a2a]"
                @change="setStatus(r, $event.target.value)"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </td>
            <td class="p-2">
              <button type="button" class="text-red-600 underline text-xs" @click="del(r)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="editModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000] p-4"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
    >
      <div
        class="bg-white dark:bg-[#1a1a1a] rounded-lg max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-xl text-gray-900 dark:text-gray-100"
        @click.stop
      >
        <h2 class="text-lg font-bold mb-1">Отклик №{{ editId }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ editCompanyName }}</p>
        <form class="flex flex-col gap-3 text-sm" @submit.prevent="saveEdit">
          <label class="flex flex-col gap-1">
            <span class="font-medium">Автор (отображаемое имя)</span>
            <input
              v-model="editForm.authorDisplay"
              required
              maxlength="120"
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-medium">Текст отклика</span>
            <textarea
              v-model="editForm.text"
              required
              minlength="1"
              maxlength="5000"
              rows="8"
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a] font-sans"
            />
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="font-medium">Оценка</span>
              <select
                v-model.number="editForm.rating"
                required
                class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
              >
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-medium">Статус</span>
              <select v-model="editForm.status" required class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]">
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 sm:col-span-2">
              <span class="font-medium">Трудоустройство после практики</span>
              <input
                v-model="editForm.employment"
                required
                maxlength="200"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
              />
            </label>
            <label class="flex flex-col gap-1 sm:col-span-2">
              <span class="font-medium">Формат / место</span>
              <input
                v-model="editForm.location"
                required
                maxlength="200"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
              />
            </label>
            <label class="flex flex-col gap-1 sm:col-span-2">
              <span class="font-medium">Период (подпись)</span>
              <input
                v-model="editForm.periodLabel"
                maxlength="100"
                placeholder="например, лето 2025"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
              />
            </label>
          </div>
          <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="flex-1 py-2.5 bg-[#212121] dark:bg-gray-200 dark:text-gray-900 text-white rounded font-medium">
              Сохранить
            </button>
            <button type="button" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded" @click="closeEditModal">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useBackdropDismiss } from '../../composables/useBackdropDismiss'
import { apiFetch } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const reviews = ref([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref('')

const editModal = ref(false)
const editId = ref(null)
const editCompanyName = ref('')
const saveError = ref('')
const editForm = reactive({
  authorDisplay: '',
  text: '',
  rating: 5,
  employment: '',
  location: '',
  periodLabel: '',
  status: 'PENDING',
})

function closeEditModal() {
  editModal.value = false
  editId.value = null
  saveError.value = ''
}

const { onBackdropPointerDown, onBackdropPointerUp } = useBackdropDismiss(closeEditModal)

function openEdit(r) {
  editId.value = r.id
  editCompanyName.value = r.companyName
  Object.assign(editForm, {
    authorDisplay: r.authorDisplay,
    text: r.text,
    rating: r.rating,
    employment: r.employment,
    location: r.location,
    periodLabel: r.periodLabel ?? '',
    status: r.status,
  })
  saveError.value = ''
  editModal.value = true
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const q = filterStatus.value ? `?status=${encodeURIComponent(filterStatus.value)}` : ''
    const data = await apiFetch(`/api/admin/reviews${q}`, { token: auth.token })
    reviews.value = data.reviews
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function setStatus(r, status) {
  try {
    await apiFetch(`/api/admin/reviews/${r.id}`, {
      method: 'PATCH',
      body: { status },
      token: auth.token,
    })
    r.status = status
  } catch (e) {
    error.value = e.message
    await load()
  }
}

async function saveEdit() {
  saveError.value = ''
  const body = {
    status: editForm.status,
    authorDisplay: editForm.authorDisplay.trim(),
    text: editForm.text.trim(),
    rating: editForm.rating,
    employment: editForm.employment.trim(),
    location: editForm.location.trim(),
    periodLabel: editForm.periodLabel.trim() ? editForm.periodLabel.trim() : null,
  }
  if (!body.text) {
    saveError.value = 'Текст не может быть пустым'
    return
  }
  try {
    const data = await apiFetch(`/api/admin/reviews/${editId.value}`, {
      method: 'PATCH',
      body,
      token: auth.token,
    })
    const updated = data.review
    const idx = reviews.value.findIndex((x) => x.id === updated.id)
    if (idx !== -1) {
      reviews.value[idx] = { ...reviews.value[idx], ...updated }
    }
    closeEditModal()
  } catch (e) {
    saveError.value = e.message || 'Ошибка сохранения'
  }
}

async function del(r) {
  if (!confirm('Удалить отклик?')) return
  try {
    await apiFetch(`/api/admin/reviews/${r.id}`, { method: 'DELETE', token: auth.token })
    await load()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>
