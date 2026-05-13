# Implementation Plan

개발 실행 순서. 각 단계는 이전 단계에 의존한다.

---

## Phase 1 — 프로젝트 뼈대

| 순서 | 작업 | 참고 |
|------|------|------|
| 1-1 | `npm create vite@latest` → React + TypeScript 초기화 | docs/setup/SETUP.md |
| 1-2 | npm 의존성 전체 설치 (tanstack, zustand, axios, msw, zod, react-hook-form, date-fns, sonner, lucide-react, clsx, tailwind-merge, @fontsource/pretendard, vitest, testing-library) | docs/setup/SETUP.md |
| 1-3 | `tailwind.config.ts` — 색상 토큰, 폰트, 브레이크포인트 설정 | docs/design/DESIGN.md |
| 1-4 | `src/app/styles/global.css` — Pretendard 임포트, 리셋, `focus-visible`, `prefers-reduced-motion` | docs/design/DESIGN.md, docs/design/ACCESSIBILITY.md |
| 1-5 | `src/shared/config/env.ts` — `import.meta.env` 타입 안전 래퍼 | docs/setup/SETUP.md |
| 1-6 | `vitest.config.ts` + `vitest.setup.ts` — jsdom 환경, MSW 서버 beforeAll/afterEach/afterAll 설정 | docs/dev/TESTING.md §4 |
| 1-7 | MSW 서비스 워커 초기화 (`npx msw init public/ --save`) | docs/setup/SETUP.md |

---

## Phase 2 — 공통 인프라 (shared)

| 순서 | 작업 | 참고 |
|------|------|------|
| 2-1 | `src/shared/store/authStore.ts` — Zustand auth 스토어 | STATE.md §3 |
| 2-2 | `src/shared/api/queryClient.ts` — QueryClient 기본 옵션 | STATE.md §6 |
| 2-3 | `src/shared/api/queryKeys.ts` — Query Key 팩토리 | STATE.md §2 |
| 2-4 | `src/shared/api/apiClient.ts` — axios 인스턴스 + request/response 인터셉터 (Bearer 주입, 401 → refresh → retry) | API.md, ARCHITECTURE.md §5 |
| 2-5 | `src/shared/lib/logger.ts` — 클라이언트 로깅 유틸 | docs/design/QUALITY.md §3 |
| 2-6 | `src/shared/lib/formatDate.ts` — date-fns 날짜 포맷 래퍼 | API.md GET /api/task/:id |
| 2-7 | `src/shared/lib/cn.ts` — `clsx` + `tailwind-merge` 래퍼 (`cn` 유틸) | docs/dev/CONVENTIONS.md §2 |

---

## Phase 3 — 공통 UI 컴포넌트 (shared/ui)

각 컴포넌트는 단위 테스트를 함께 작성한다.

| 순서 | 컴포넌트 | 핵심 요구사항 |
|------|----------|--------------|
| 3-1 | `Button` | variant (primary/danger/ghost), isLoading, disabled + aria | COMPONENTS.md |
| 3-2 | `Input` | label 연결, error/hint aria-describedby, password 토글 | COMPONENTS.md |
| 3-3 | `Modal` | role="dialog", 포커스 트랩, ESC 닫기, Portal | COMPONENTS.md, docs/design/ACCESSIBILITY.md §5 |
| 3-4 | `Card` | onClick 시 button 기반, 키보드 지원 | COMPONENTS.md |
| 3-5 | `EmptyState` | title/description/action, aria-live | COMPONENTS.md |
| 3-6 | `LoadingSpinner` | role="status", aria-label | COMPONENTS.md |

---

## Phase 4 — MSW 핸들러

실제 API 구현 전 모든 엔드포인트의 mock을 먼저 완성한다.

| 순서 | 파일 | 엔드포인트 |
|------|------|-----------|
| 4-1 | `src/mocks/handlers/auth.ts` | POST /api/sign-in, POST /api/refresh |
| 4-2 | `src/mocks/handlers/dashboard.ts` | GET /api/dashboard |
| 4-3 | `src/mocks/handlers/task.ts` | GET /api/task, GET /api/task/:id, DELETE /api/task/:id |
| 4-4 | `src/mocks/handlers/user.ts` | GET /api/user |
| 4-5 | `src/mocks/handlers/index.ts` | 개별 핸들러 합산 export (`[...authHandlers, ...dashboardHandlers, ...]`) |
| 4-6 | `src/mocks/browser.ts` / `src/mocks/server.ts` | worker 설정 |

---

## Phase 5 — 라우팅 및 레이아웃

| 순서 | 작업 | 참고 |
|------|------|------|
| 5-1 | TanStack Router 라우트 파일 생성 (`__root.tsx`, `index.tsx`, `sign-in.tsx`, `task/index.tsx`, `task/$id.tsx`, `user.tsx`) | ARCHITECTURE.md §3 |
| 5-2 | `__root.tsx` — `beforeLoad` 인증 가드 (accessToken 없으면 /sign-in redirect) | ARCHITECTURE.md §3, STATE.md §5 |
| 5-3 | `src/widgets/app-layout/` — GNB + LNB (LayoutDashboard, CheckSquare, UserCircle, LogIn 아이콘) | docs/design/DESIGN.md §6, PRD.md §5 |
| 5-4 | `src/app/providers/index.tsx` — QueryClientProvider + RouterProvider + Sonner Toaster | ARCHITECTURE.md |
| 5-5 | 앱 마운트 시 silent refresh 로직 (`__root.tsx beforeLoad`: 쿠키 token 존재 시 /api/refresh 호출) | STATE.md §5 |

---

## Phase 6 — 인증 기능 (features/auth)

| 순서 | 작업 |
|------|------|
| 6-1 | `signInSchema.ts` — zod 스키마 (email RFC 5322, password `^[A-Za-z0-9]{8,24}$`) |
| 6-2 | `useSignIn.ts` — react-hook-form + POST /api/sign-in + setAccessToken + navigate |
| 6-3 | `ErrorModal.tsx` — role="alertdialog", errorMessage 표시 |
| 6-4 | `SignInForm.tsx` — 폼 구성, 버튼 활성화 조건, 에러 모달 연결 |
| 6-5 | `SignInForm.test.tsx` — 유효성·제출 흐름 테스트 (docs/dev/TESTING.md 우선순위 1) |

---

## Phase 7 — 엔티티 API, 타입, 훅

| 순서 | 작업 |
|------|------|
| 7-1 | `src/entities/dashboard/` — `DashboardResponse` 타입, `getDashboard` API 함수, `useDashboard` (useQuery) 훅 |
| 7-2 | `src/entities/task/` — `TaskItem`, `TaskDetailResponse` 타입, `getTasks` / `getTaskDetail` / `deleteTask` API 함수, `useTasks` (useInfiniteQuery) / `useTaskDetail` 훅 |
| 7-3 | `src/entities/user/` — `UserResponse` 타입, `getUser` API 함수, `useUser` (useQuery) 훅 |

---

## Phase 8 — 가상 스크롤 위젯

`/task` 페이지에서 사용하므로 페이지 구현 전에 완성한다.

| 순서 | 작업 | 참고 |
|------|------|------|
| 8-1 | `TaskCard.tsx` — 고정 높이 96px, button 기반 | COMPONENTS.md |
| 8-2 | `TaskVirtualList.tsx` — `useVirtualizer` (estimateSize: 104, overscan: 3) + IntersectionObserver | docs/design/QUALITY.md §1 |

---

## Phase 9 — 페이지 구현

각 페이지를 순서대로 구현한다. 선행 phase가 모두 완료된 후 시작.

| 순서 | 페이지 | 핵심 구현 |
|------|--------|----------|
| 9-1 | 대시보드 (`/`) | `useDashboard` + `DashboardMetricCard` × 3 |
| 9-2 | 할 일 목록 (`/task`) | `useTasks(useInfiniteQuery)` + `TaskVirtualList` + IntersectionObserver sentinel |
| 9-3 | 할 일 상세 (`/task/:id`) | `useTaskDetail` + 삭제 버튼 + `DeleteConfirmModal` + 404 EmptyState |
| 9-4 | 회원정보 (`/user`) | `useUser` + name/memo 표시 |

---

## Phase 10 — 삭제 기능 (features/task-delete)

| 순서 | 작업 |
|------|------|
| 10-1 | `useDeleteTask.ts` — DELETE /api/task/:id + invalidate `queryKeys.tasks.all` + navigate('/task') |
| 10-2 | `DeleteConfirmModal.tsx` — id 일치 여부로 제출 버튼 활성화 |
| 10-3 | `DeleteConfirmModal.test.tsx` — (docs/dev/TESTING.md 우선순위 2) |

---

## Phase 11 — 마무리

| 순서 | 작업 |
|------|------|
| 11-1 | `apiClient.test.ts` — 401 인터셉터 통합 테스트 (docs/dev/TESTING.md 우선순위 4) |
| 11-2 | 접근성 최종 점검 — Tab 순서, 스크린 리더, 색상 대비 (docs/design/ACCESSIBILITY.md §9) |
| 11-3 | Lighthouse 성능·접근성 감사 |
| 11-4 | `npm run typecheck` + `npm run lint` 통과 확인 |
| 11-5 | `README.md` 작성 — 실행 방법, 기술 스택 요약, 구조 설명 |
