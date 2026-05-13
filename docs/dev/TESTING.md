# Testing Strategy

<!-- 자의적 결정: 과제 범위에서 E2E(Playwright 등)는 제외. 단위/통합 테스트만 작성. -->

---

## 1. 도구

| 도구 | 역할 |
|------|------|
| Vitest | 테스트 러너 (Vite 네이티브, Jest 호환 API) |
| @testing-library/react | 컴포넌트 렌더링 및 DOM 쿼리 |
| @testing-library/user-event | 실제 사용자 이벤트 시뮬레이션 |
| @testing-library/jest-dom | 커스텀 매처 (`toBeInTheDocument` 등) |
| MSW v2 | API 핸들러 재사용 — 테스트 환경에서도 동일 핸들러 활용 |
| happy-dom | DOM 환경 시뮬레이션 |

---

## 2. 테스트 범위 및 우선순위

### 우선순위 1 — 폼 유효성 및 제출 흐름

| 테스트 대상 | 검증 항목 |
|-------------|-----------|
| `SignInForm` | 빈 입력 → 제출 버튼 비활성화 |
| `SignInForm` | 잘못된 이메일 형식 → 에러 메시지 표시 |
| `SignInForm` | 비밀번호 7자 → 에러 메시지 표시 |
| `SignInForm` | 유효한 입력 → 제출 버튼 활성화 |
| `SignInForm` | 제출 → API 400 → ErrorModal 표시 |
| `SignInForm` | 제출 → API 200 → /로 리다이렉트 |

### 우선순위 2 — 삭제 확인 모달

| 테스트 대상 | 검증 항목 |
|-------------|-----------|
| `DeleteConfirmModal` | input 비어있음 → 제출 버튼 비활성화 |
| `DeleteConfirmModal` | 틀린 id 입력 → 제출 버튼 비활성화 |
| `DeleteConfirmModal` | 정확한 id 입력 → 제출 버튼 활성화 |
| `DeleteConfirmModal` | 제출 클릭 → onConfirm 호출됨 |

### 우선순위 3 — 공통 컴포넌트

| 테스트 대상 | 검증 항목 |
|-------------|-----------|
| `Button` | `disabled=true` → 클릭 이벤트 미발생 |
| `Button` | `isLoading=true` → 스피너 렌더링 |
| `Input` | `error` prop → `role="alert"` 메시지 렌더링 |
| `Modal` | `isOpen=false` → DOM에 없음 |
| `Modal` | ESC 키 → `onClose` 호출 |

### 우선순위 4 — 인증 흐름 통합 테스트

| 테스트 대상 | 검증 항목 |
|-------------|-----------|
| `__root.tsx beforeLoad` | accessToken 없음 → /sign-in redirect (search.redirect 포함) |
| `apiClient` 인터셉터 | 401 응답 → /api/refresh 호출 |
| `apiClient` 인터셉터 | refresh 성공 → 원래 요청 재시도 |
| `apiClient` 인터셉터 | refresh 실패 → clearAuth 호출 |

---

## 3. 테스트 파일 위치

FSD 구조를 따른다. 각 테스트 파일은 테스트 대상과 동일한 레이어·슬라이스 내에 위치한다.

```
src/
├── shared/
│   ├── ui/
│   │   ├── Button/
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   │   └── Input.test.tsx
│   │   └── Modal/
│   │       └── Modal.test.tsx
│   └── api/
│       └── apiClient.test.ts
├── features/
│   ├── auth/
│   │   └── ui/
│   │       └── SignInForm.test.tsx
│   └── task-delete/
│       └── ui/
│           └── DeleteConfirmModal.test.tsx
└── app/
    └── router/
        └── routes/
            └── __root.test.tsx   # beforeLoad 인증 가드 통합 테스트
```

---

## 4. MSW 테스트 환경 설정

```ts
// src/mocks/server.ts — Node 환경용 (테스트)
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

특정 테스트에서 에러 케이스 재현:
```ts
server.use(
  http.post('/api/sign-in', () =>
    HttpResponse.json({ errorMessage: '잘못된 인증 정보' }, { status: 400 })
  )
);
```

---

## 5. 커버리지 목표

<!-- 자의적 결정: 과제 제출용 최소 목표 -->

| 구분 | 목표 |
|------|------|
| 우선순위 1·2 (폼/모달) | 100% |
| 우선순위 3 (공통 컴포넌트) | 80% 이상 |
| 우선순위 4 (통합) | 주요 경로만 (happy path + 401 흐름) |

---

## 6. 실행 명령

`docs/setup/SETUP.md` 섹션 7 참고. (`npm test` / `npm run test:run` / `npm run test:coverage`)

`vitest.config.ts` 설정 시 `coverage.provider: 'v8'` 사용 <!-- 자의적 결정 -->.
