# State Management Design

---

## 1. 상태 분류 원칙

| 상태 종류 | 도구 | 기준 |
|-----------|------|------|
| 서버 데이터 (API 응답) | TanStack Query v5 | 캐싱, 동기화, 로딩/에러 상태 자동 관리 |
| 인증 상태 | Zustand v5 | 페이지 간 공유, 즉시 동기 접근 필요 |
| UI 상태 (모달 열림 등) | 로컬 `useState` | 단일 컴포넌트 범위, 공유 불필요 |

---

## 2. 서버 상태 — TanStack Query

### Query Key 규칙

```ts
// src/shared/api/queryKeys.ts
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  tasks: {
    all: ['tasks'] as const,
    list: () => [...queryKeys.tasks.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
  },
  user: ['user'] as const,
};
```

### Query 설정 요약

| Query Key | Hook | staleTime | gcTime | 비고 |
|-----------|------|-----------|--------|------|
| `['dashboard']` | `useDashboard` | 30s | 5min | 수동 새로고침 없음 |
| `['tasks', 'list']` | `useTasks` | 1min | 10min | `useInfiniteQuery` |
| `['tasks', 'detail', id]` | `useTaskDetail` | 5min | 10min | 삭제 후 invalidate |
| `['user']` | `useUser` | 10min | 30min | 회원정보 변경 없음 |

### 무한 스크롤 쿼리 구조

```ts
useInfiniteQuery({
  queryKey: queryKeys.tasks.list(),
  queryFn: ({ pageParam }) => getTasks(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage, _allPages, lastPageParam) =>
    lastPage.hasNext ? lastPageParam + 1 : undefined,
});
```

`hasNext: false`이면 `getNextPageParam`이 `undefined`를 반환해 자동 중단.

### Mutation 후 invalidation

| Mutation | Invalidate |
|----------|------------|
| `DELETE /api/task/:id` 성공 | `queryKeys.tasks.all` (목록 + 상세 모두) |

---

## 3. 클라이언트 상태 — Zustand

### authStore (`src/shared/store/authStore.ts`)

```ts
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}
```

| 액션 | 호출 시점 |
|------|-----------|
| `setAccessToken` | 로그인 성공, 토큰 갱신 성공 |
| `clearAuth` | 로그아웃, 토큰 갱신 실패 |

- 스토어는 `persist` 미들웨어 **비사용** — accessToken은 새로고침 시 소멸.
  - 새로고침 후 복구: 앱 마운트 시 `POST /api/refresh` 자동 호출 → 성공하면 `setAccessToken`.
  - <!-- [프로덕션 주석] 실제 환경에서는 refreshToken이 HttpOnly 쿠키에 있으므로 새로고침 후 /api/refresh 호출만으로 accessToken 복구 가능. 현재는 JS document.cookie(token)으로 동일 흐름 시뮬레이션. -->

---

## 4. UI 상태 — 로컬 useState

컴포넌트 로컬로 관리하며 스토어/쿼리로 올리지 않는다.

| 상태 | 컴포넌트 |
|------|----------|
| 삭제 모달 열림 여부 | `TaskDetailView` |
| 에러 모달 열림 여부 | `SignInForm` |
| 비밀번호 표시 여부 | `Input` (password 타입) |

---

## 5. 인증 상태 생명주기

```
앱 초기화 (__root.tsx beforeLoad)
  └─> authStore.accessToken === null?
        ├─> YES: 쿠키(token)에 refreshToken 있음?
        │         ├─> YES: POST /api/refresh → setAccessToken + document.cookie token 갱신
        │         └─> NO: 비로그인 상태 유지
        └─> NO: 이미 로그인 상태

라우트 접근
  └─> __root.tsx beforeLoad: accessToken 없음?
        └─> YES: /sign-in 리다이렉트 (search: { redirect: pathname })

로그인
  └─> POST /api/sign-in 성공
        └─> setAccessToken + document.cookie token 저장
        └─> router.navigate({ to: search.redirect ?? '/' })

토큰 만료 (401)
  └─> 인터셉터: POST /api/refresh
        ├─> 성공: setAccessToken + 원래 요청 재시도
        └─> 실패: clearAuth + /sign-in 리다이렉트
```

---

## 6. QueryClient 설정 (`src/shared/api/queryClient.ts`)

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      throwOnError: false, // 컴포넌트별 에러 처리
    },
    mutations: {
      retry: 0,
    },
  },
});
```
