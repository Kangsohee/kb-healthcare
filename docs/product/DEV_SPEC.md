# Developer Spec

페이지·기능 단위 개발 명세. 각 항목별로 필요한 컴포넌트·API·상태·유효성·에러 처리를 한눈에 참조.

전체 설계 원칙: `docs/architecture/ARCHITECTURE.md` / 컴포넌트 상세: `docs/architecture/COMPONENTS.md` / API 계약: `docs/architecture/API.md`

---

## 1. 로그인 (`/sign-in`)

### 구성 컴포넌트

| 컴포넌트 | 위치 |
|----------|------|
| `SignInForm` | `src/features/auth/ui/SignInForm.tsx` |
| `Input` (email, password) | `src/shared/ui/Input/` |
| `Button` (submit) | `src/shared/ui/Button/` |
| `ErrorModal` | `src/features/auth/ui/ErrorModal.tsx` |

### API

| 메서드 | 엔드포인트 | Hook |
|--------|-----------|------|
| POST | `/api/sign-in` | `useSignIn` (`src/features/auth/model/useSignIn.ts`) |

### 유효성 규칙 (zod)

| 필드 | 규칙 |
|------|------|
| email | RFC 5322 형식 (`z.string().email()`) |
| password | 영문+숫자, 8~24자 (`z.string().regex(/^[A-Za-z0-9]{8,24}$/)`) |

### 상태

- `formState.isValid` → 제출 버튼 활성화 여부
- `isSubmitting` → 버튼 `isLoading=true`
- `errorModal: boolean` → `useState` (로컬)

### 성공/실패 처리

| 결과 | 동작 |
|------|------|
| 200 | `setAccessToken` → `document.cookie` (`token=...`) 저장 → `router.navigate({ to: search.redirect ?? '/' })` |
| 400 | `ErrorModal` 열기, `errorMessage` 표시 |

### 접근성 체크

- `<form noValidate>` (브라우저 기본 팝업 비활성화)
- 각 Input에 `<label htmlFor>` 명시적 연결
- 에러 메시지 `role="alert"`
- 제출 버튼 `disabled` + `aria-disabled="true"` 동시 적용

---

## 2. 대시보드 (`/`)

### 구성 컴포넌트

| 컴포넌트 | 위치 |
|----------|------|
| `DashboardMetricCard` × 3 | `src/entities/dashboard/ui/DashboardMetricCard.tsx` |
| `LoadingSpinner` | `src/shared/ui/LoadingSpinner/` |

### API

| 메서드 | 엔드포인트 | Hook |
|--------|-----------|------|
| GET | `/api/dashboard` | `useDashboard` (`src/entities/dashboard/`) |

### Query 설정

```ts
queryKey: queryKeys.dashboard   // ['dashboard']
staleTime: 30_000               // 30초 (STATE.md 참고)
```

### 표시 데이터

| UI 레이블 | API 필드 |
|-----------|----------|
| 일 | `numOfTask` |
| 해야할 일 | `numOfRestTask` |
| 한 일 | `numOfDoneTask` |

### 에러 처리

- 401 → axios 인터셉터가 토큰 갱신 처리 (페이지 수준 별도 처리 불필요)
- 갱신 실패 → 인터셉터가 `/sign-in` 리다이렉트

---

## 3. 할 일 목록 (`/task`)

### 구성 컴포넌트

| 컴포넌트 | 위치 |
|----------|------|
| `TaskVirtualList` | `src/widgets/task-virtual-list/ui/TaskVirtualList.tsx` |
| `TaskCard` | `src/entities/task/ui/TaskCard.tsx` |
| `LoadingSpinner` (sentinel) | `src/shared/ui/LoadingSpinner/` |
| `EmptyState` | `src/shared/ui/EmptyState/` |

### API

| 메서드 | 엔드포인트 | Hook |
|--------|-----------|------|
| GET | `/api/task?page={n}` | `useTasks` — `useInfiniteQuery` |

### Query 설정

```ts
queryKey: queryKeys.tasks.list()   // ['tasks', 'list']
staleTime: 60_000                  // 1분 (STATE.md 참고)
initialPageParam: 1
getNextPageParam: (lastPage, _all, lastPageParam) =>
  lastPage.hasNext ? lastPageParam + 1 : undefined
```

### 렌더링 전략

1. `useInfiniteQuery`로 전체 페이지 데이터 관리
2. `pages.flatMap(p => p.data)` → `allItems` 배열 생성
3. `useVirtualizer({ estimateSize: () => 104, overscan: 3 })` 적용 (카드 96px + 하단 갭 8px)
4. 하단 sentinel `div`에 `IntersectionObserver` → `fetchNextPage()` 호출
5. `hasNextPage && isFetchingNextPage` → sentinel에 `LoadingSpinner` 표시

### 접근성

- 가상화 컨테이너 `role="list"`, 각 아이템 `role="listitem"`
- sentinel: `aria-label="다음 항목 불러오는 중"`

---

## 4. 할 일 상세 (`/task/:id`)

### 구성 컴포넌트

| 컴포넌트 | 위치 |
|----------|------|
| `TaskDetailView` | `src/pages/task-detail/index.tsx` (구성 컴포넌트) |
| `DeleteConfirmModal` | `src/features/task-delete/ui/DeleteConfirmModal.tsx` |
| `Button` (삭제, 목록으로) | `src/shared/ui/Button/` |
| `EmptyState` (404) | `src/shared/ui/EmptyState/` |
| `LoadingSpinner` | `src/shared/ui/LoadingSpinner/` |

### API

| 메서드 | 엔드포인트 | Hook |
|--------|-----------|------|
| GET | `/api/task/:id` | `useTaskDetail(id)` |
| DELETE | `/api/task/:id` | `useDeleteTask` (`src/features/task-delete/model/useDeleteTask.ts`) |

### Query 설정

```ts
queryKey: queryKeys.tasks.detail(id)   // ['tasks', 'detail', id]
staleTime: 300_000                     // 5분 (STATE.md 참고)
```

### 표시 데이터

| 레이블 | API 필드 | 포맷 |
|--------|---------|------|
| 제목 | `title` | 그대로 |
| 메모 | `memo` | 그대로 |
| 등록일 | `registerDatetime` | `format(new Date(v), 'yyyy.MM.dd HH:mm')` |

### 삭제 플로우

1. [삭제] 버튼 → `deleteModalOpen = true`
2. `DeleteConfirmModal` 표시: `taskId`와 동일한 값 입력 시 제출 버튼 활성화
3. 제출 → `DELETE /api/task/:id`
4. 성공 → `queryClient.invalidateQueries(queryKeys.tasks.all)` → `router.navigate({ to: '/task' })`

### 에러 처리

| 상태 | 처리 |
|------|------|
| 404 | `EmptyState` ("리소스를 찾을 수 없습니다.") + [목록으로 돌아가기] 버튼 |
| 삭제 실패 | `logger.error` + sonner 토스트 |

---

## 5. 회원정보 (`/user`)

### 구성 컴포넌트

| 컴포넌트 | 위치 |
|----------|------|
| `UserProfileView` | `src/pages/user/index.tsx` (구성 컴포넌트) |
| `LoadingSpinner` | `src/shared/ui/LoadingSpinner/` |

### API

| 메서드 | 엔드포인트 | Hook |
|--------|-----------|------|
| GET | `/api/user` | `useUser` (`src/entities/user/`) |

### Query 설정

```ts
queryKey: queryKeys.user   // ['user']
staleTime: 600_000         // 10분 (STATE.md 참고)
```

### 표시 데이터

| 레이블 | API 필드 |
|--------|---------|
| 이름 | `name` |
| 메모 | `memo` |

---

## 6. 앱 레이아웃 (`AppLayout`)

### 구성

| 컴포넌트 | 위치 |
|----------|------|
| `AppLayout` | `src/widgets/app-layout/ui/AppLayout.tsx` |
| `GNB` | `src/widgets/app-layout/ui/GNB.tsx` |
| `LNB` | `src/widgets/app-layout/ui/LNB.tsx` |

### GNB

- 로그인 상태: `UserCircle` 아이콘 → `/user` 이동
- 미로그인 상태: `LogIn` 아이콘 → `/sign-in` 이동
- `authStore.accessToken` 유무로 상태 구분

### LNB

| 메뉴 | 아이콘 | 경로 | 활성 조건 |
|------|--------|------|----------|
| 대시보드 | `LayoutDashboard` | `/` | `pathname === '/'` |
| 할 일 | `CheckSquare` | `/task` | `pathname.startsWith('/task')` |

- 활성 메뉴: `aria-current="page"`, 좌측 `border-l-2 border-primary text-primary`
- `<nav aria-label="주 메뉴">` + `<ul>` + `<li>` 구조

### 인증 상태에 따른 렌더링

- `/sign-in` 라우트: `AppLayout` 미적용 (LNB 없음, GNB만 또는 전체 없음)
- 인증 필요 라우트: `AppLayout`으로 wrapping

---

## 7. 인증 인터셉터 (`apiClient`)

### 동작 순서

```
Request:
  accessToken 존재 → Authorization: Bearer {token} 헤더 자동 주입

Response (401):
  _retry 플래그 없음 → POST /api/refresh (쿠키 token 자동 전송)
    성공 → setAccessToken(newToken) + document.cookie token 갱신 + 원래 요청 재시도
    실패 → clearAuth() + document.cookie token 삭제 + logger.error + router.navigate({ to: '/sign-in' })
```

### 테스트 대상 (TESTING.md 우선순위 4)

- 401 응답 → `/api/refresh` 호출 확인
- refresh 성공 → 원래 요청 재시도 확인
- refresh 실패 → `clearAuth` 호출 확인
