import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../api/client.js'

const TOKEN_KEY = 'practice_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) ?? '')
  const user = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  async function fetchMe() {
    if (!token.value) {
      user.value = null
      return
    }
    try {
      const data = await apiFetch('/api/auth/me', { token: token.value })
      user.value = data.user
    } catch (e) {
      // Только недействительный токен / нет пользователя — сбрасываем сессию.
      // Сеть, 5xx, таймаут: не трогаем localStorage (часто при F5, если API ещё не поднялся).
      if (e?.status === 401) {
        setSession('', null)
      }
    }
  }

  async function restoreSession() {
    if (!token.value) return
    loading.value = true
    try {
      await fetchMe()
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    })
    setSession(data.token, data.user)
    return data
  }

  async function register(payload) {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
    setSession(data.token, data.user)
    return data
  }

  function logout() {
    setSession('', null)
  }

  async function changePassword(body) {
    await apiFetch('/api/profile/password', {
      method: 'PUT',
      body,
      token: token.value,
    })
  }

  async function updateProfile(body) {
    await apiFetch('/api/profile', {
      method: 'PUT',
      body,
      token: token.value,
    })
    await fetchMe()
  }

  async function uploadResume(file) {
    const fd = new FormData()
    fd.append('resume', file)
    const data = await apiFetch('/api/profile/resume', {
      method: 'POST',
      body: fd,
      token: token.value,
    })
    user.value = data.user
  }

  async function deleteResume() {
    const data = await apiFetch('/api/profile/resume', {
      method: 'DELETE',
      token: token.value,
    })
    user.value = data.user
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    setSession,
    fetchMe,
    restoreSession,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    uploadResume,
    deleteResume,
  }
})
