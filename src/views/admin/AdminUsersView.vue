<template>
  <div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left p-3 font-semibold">Email</th>
            <th class="text-left p-3 font-semibold">Роль</th>
            <th class="text-left p-3 font-semibold">Блок</th>
            <th class="text-left p-3 font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-gray-100">
            <td class="p-3">{{ u.email }}</td>
            <td class="p-3">
              <select
                v-model="u.role"
                class="border border-gray-300 rounded px-2 py-1"
                @change="patchUser(u)"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </td>
            <td class="p-3">
              <label class="inline-flex items-center gap-2">
                <input v-model="u.blocked" type="checkbox" @change="patchUser(u)" />
                заблокирован
              </label>
            </td>
            <td class="p-3 text-gray-400 text-xs">{{ formatDate(u.createdAt) }}</td>
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
const users = ref([])
const loading = ref(true)
const error = ref('')

function formatDate(s) {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString('ru-RU')
  } catch {
    return s
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiFetch('/api/admin/users', { token: auth.token })
    users.value = data.users.map((u) => ({ ...u }))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function patchUser(u) {
  try {
    await apiFetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: { role: u.role, blocked: u.blocked },
      token: auth.token,
    })
    await load()
  } catch (e) {
    error.value = e.message
    await load()
  }
}

onMounted(load)
</script>
