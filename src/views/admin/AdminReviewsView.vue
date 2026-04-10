<template>
  <div>
    <div class="flex flex-wrap gap-3 mb-4">
      <select v-model="filterStatus" class="border border-gray-300 rounded px-3 py-2 text-sm" @change="load">
        <option value="">Все статусы</option>
        <option value="PENDING">PENDING</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
    </div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left p-2 font-semibold">ID</th>
            <th class="text-left p-2 font-semibold">Компания</th>
            <th class="text-left p-2 font-semibold">Автор</th>
            <th class="text-left p-2 font-semibold">Рейтинг</th>
            <th class="text-left p-2 font-semibold">Статус</th>
            <th class="text-left p-2 font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reviews" :key="r.id" class="border-b border-gray-100 align-top">
            <td class="p-2">{{ r.id }}</td>
            <td class="p-2">{{ r.companyName }}</td>
            <td class="p-2">{{ r.authorDisplay }}</td>
            <td class="p-2">{{ r.rating }}</td>
            <td class="p-2">
              <select
                :value="r.status"
                class="border rounded px-1 py-0.5 max-w-[120px]"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const reviews = ref([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref('')

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
