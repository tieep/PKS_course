const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Request failed')
  return payload.data
}

export { API_URL }
