import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { apiClient } from './apiClient'
import { useAuthStore } from '@/shared/store/authStore'

const BASE = 'http://localhost'

// window.location.href를 추적하기 위한 mock (유효한 URL로 초기화해야 XHR이 동작)
const locationMock = { href: BASE }
Object.defineProperty(window, 'location', { writable: true, value: locationMock })

describe('apiClient 401 인터셉터', () => {
  beforeAll(() => {
    apiClient.defaults.baseURL = BASE
  })

  beforeEach(() => {
    useAuthStore.setState({ accessToken: null })
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    locationMock.href = BASE
  })

  it('401 응답 시 /api/refresh를 호출하고 원래 요청을 재시도한다', async () => {
    let callCount = 0

    server.use(
      http.get(`${BASE}/api/ping`, () => {
        callCount++
        if (callCount === 1) return HttpResponse.json({}, { status: 401 })
        return HttpResponse.json({ ok: true })
      }),
      http.post(`${BASE}/api/refresh`, () =>
        HttpResponse.json({ accessToken: 'new-token', refreshToken: 'new-refresh' }),
      ),
    )

    const res = await apiClient.get('/api/ping')

    expect(res.data).toEqual({ ok: true })
    expect(callCount).toBe(2)
    expect(useAuthStore.getState().accessToken).toBe('new-token')
    expect(document.cookie).toContain('token=new-refresh')
  })

  it('refresh 실패 시 clearAuth를 호출하고 /sign-in으로 이동한다', async () => {
    server.use(
      http.get(`${BASE}/api/ping`, () => HttpResponse.json({}, { status: 401 })),
      http.post(`${BASE}/api/refresh`, () => HttpResponse.json({}, { status: 401 })),
    )

    await expect(apiClient.get('/api/ping')).rejects.toBeDefined()

    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(document.cookie).not.toContain('token=')
    expect(locationMock.href).toBe('/sign-in')
  })
})
