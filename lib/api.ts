export async function fetchWithAuth(path: string, init: RequestInit = {}) {
  if (!path.startsWith('/api/')) {
    throw new TypeError('API requests must use a same-origin /api path')
  }

  const headers = new Headers(init.headers)
  const token = typeof window === 'undefined' ? null : window.localStorage.getItem('swaply_token')

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(path, {
    ...init,
    headers,
    credentials: init.credentials ?? 'same-origin',
  })
}

export const api = {
  getOffers: () => fetchWithAuth('/api/offers'),
  getMembers: () => fetchWithAuth('/api/users'),
  searchMembers: (query: string) =>
    fetchWithAuth(`/api/users?query=${encodeURIComponent(query)}`),
  getCurrentUser: () => fetchWithAuth('/api/auth/me'),
  logout: () => fetchWithAuth('/api/auth/logout', { method: 'POST' }),
}
