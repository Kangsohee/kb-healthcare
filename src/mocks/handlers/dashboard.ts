import { http, HttpResponse } from 'msw'
import { TOTAL, DONE_COUNT, TODO_COUNT } from './task'

export const dashboardHandlers = [
  http.get('/api/dashboard', () => {
    return HttpResponse.json({
      numOfTask: TOTAL,
      numOfRestTask: TODO_COUNT,
      numOfDoneTask: DONE_COUNT,
    })
  }),
]
