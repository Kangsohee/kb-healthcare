import { http, HttpResponse } from 'msw'

const PAGE_SIZE = 10

interface TaskItem {
  id: string
  title: string
  memo: string
  status: 'TODO' | 'DONE'
}

const BASE_TITLES = [
  { title: '혈압 측정 및 기록', memo: '아침 기상 후 10분 안정 후 측정' },
  { title: '유산소 운동', memo: '30분 이상 빠르게 걷기 또는 자전거' },
  { title: '내과 정기검진 예약', memo: '3개월마다 혈당·콜레스테롤 수치 확인' },
  { title: '혈당 수치 체크', memo: '식후 2시간 혈당 목표: 140 mg/dL 이하' },
  { title: '고혈압 약 복용', memo: '매일 아침 식후 암로디핀 5mg 복용' },
  { title: '수면 시간 기록', memo: '취침·기상 시간 앱에 입력 (목표 7시간)' },
  { title: '주간 식단 계획 작성', memo: '나트륨 2,000mg 이하, 채소 위주 구성' },
  { title: '스트레스 관리 일지', memo: '명상 10분 + 스트레스 지수 1~10 기록' },
  { title: '체중·BMI 측정', memo: '매주 월요일 아침 공복 상태에서 측정' },
  { title: '안과 검진 예약', memo: '시력 변화 확인, 안압 추가 체크 필요' },
  { title: '비타민 D 복용', memo: '점심 식사 후 2,000IU 복용' },
  { title: '금연 일지 작성', memo: '흡연 충동 횟수와 대처법 기록' },
  { title: '독감 예방접종 확인', memo: '10월 말 예약 — 보건소 또는 가까운 병원' },
  { title: '수분 섭취 2L 달성', memo: '하루 8잔 목표, 오후 3시 기준 절반 체크' },
  { title: '허리 스트레칭', memo: '점심 후 15분 코어 강화 루틴' },
  { title: '주간 건강 리포트 검토', memo: '앱 주간 요약 데이터 확인 및 목표 조정' },
  { title: '치과 스케일링 예약', memo: '6개월마다 정기 — 다음 예약: 6월 초' },
  { title: '수면 무호흡 검사 상담', memo: '코골이 증상 지속, 수면 클리닉 예약' },
  { title: '혈액 검사 결과 확인', memo: '페리틴·갑상선 TSH 수치 이상 여부 확인' },
  { title: '심박수 모니터링', memo: '안정 시 60~80bpm 목표, 스마트워치 기록' },
]

const TOTAL = 200

const tasks: TaskItem[] = Array.from({ length: TOTAL }, (_, i) => {
  const base = BASE_TITLES[i % BASE_TITLES.length]
  return {
    id: `task-${i + 1}`,
    title: `${i + 1}. ${base.title}`,
    memo: base.memo,
    status: i % 3 === 0 ? 'DONE' : 'TODO',
  }
})

const DONE_COUNT = tasks.filter((t) => t.status === 'DONE').length
const TODO_COUNT = tasks.filter((t) => t.status === 'TODO').length

const BASE_TIME = new Date('2026-01-01T09:00:00').getTime()
const DAY_MS = 1000 * 60 * 60 * 12

const taskDetails: Record<string, { title: string; memo: string; registerDatetime: string }> =
  Object.fromEntries(
    tasks.map((t, i) => [
      t.id,
      {
        title: t.title,
        memo: t.memo,
        registerDatetime: new Date(BASE_TIME + i * DAY_MS).toISOString(),
      },
    ]),
  )

export { TOTAL, DONE_COUNT, TODO_COUNT }

export const taskHandlers = [
  http.get('/api/task', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const start = (page - 1) * PAGE_SIZE
    const data = tasks.slice(start, start + PAGE_SIZE)
    const hasNext = start + PAGE_SIZE < tasks.length

    return HttpResponse.json({ data, hasNext })
  }),

  http.get('/api/task/:id', ({ params }) => {
    const detail = taskDetails[params.id as string]
    if (!detail) {
      return HttpResponse.json(
        { errorMessage: '존재하지 않는 할 일입니다.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(detail)
  }),

  http.delete('/api/task/:id', ({ params }) => {
    const id = params.id as string
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json(
        { errorMessage: '존재하지 않는 할 일입니다.' },
        { status: 404 },
      )
    }
    tasks.splice(index, 1)
    delete taskDetails[id]
    return HttpResponse.json({ success: true })
  }),
]
