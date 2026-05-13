import { http, HttpResponse } from 'msw'

export const userHandlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({
      name: '김건강',
      memo: '규칙적인 운동과 식단으로 건강한 생활을 만들어 가고 있습니다.',
    })
  }),
]
