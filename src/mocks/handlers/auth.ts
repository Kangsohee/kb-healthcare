import { http, HttpResponse } from 'msw'

const VALID_EMAIL = 'user@example.com'
const VALID_PASSWORD = 'abc12345'

const MOCK_ACCESS_TOKEN = 'mock-access-token'
const MOCK_REFRESH_TOKEN = 'mock-refresh-token'

export const authHandlers = [
  http.post('/api/sign-in', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email !== VALID_EMAIL || body.password !== VALID_PASSWORD) {
      return HttpResponse.json(
        { errorMessage: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 400 },
      )
    }

    return HttpResponse.json({
      accessToken: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
    })
  }),

  http.post('/api/refresh', ({ request }) => {
    const cookieHeader = request.headers.get('cookie') ?? ''
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/)
    const token = match?.[1]

    if (!token || token !== MOCK_REFRESH_TOKEN) {
      return HttpResponse.json(
        { errorMessage: '유효하지 않은 토큰입니다.' },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      accessToken: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
    })
  }),
]
