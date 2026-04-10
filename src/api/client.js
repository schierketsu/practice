const API_BASE = import.meta.env.VITE_API_BASE ?? ''

function getStoredToken() {
  return localStorage.getItem('practice_token') ?? ''
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, token: tokenOpt, skipAuth = false } = options
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = tokenOpt !== undefined ? tokenOpt : skipAuth ? null : getStoredToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }
  if (!res.ok) {
    const err = new Error(data.error || `Ошибка ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
