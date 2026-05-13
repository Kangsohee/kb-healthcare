# Architecture Decisions

## 1. 기술 스택 요약

| 레이어 | 선택 | 근거 |
|--------|------|------|
| 프레임워크 | React 18 + TypeScript 5 | requirement.md 필수 명시 |
| 폰트 | Pretendard | requirement.md 필수 명시 |
| 색상 토큰 | TailwindCSS `theme.extend.colors` | requirement.md "색상은 토큰으로 관리" 명시. TypeScript 자동완성 지원 |
| 가상 스크롤 | @tanstack/react-virtual v3 | requirement.md 필수 명시. TanStack Query와 동일 생태계 |
| 서버 상태·무한스크롤 | TanStack Query v5 | requirement.md 필수 명시. `useInfiniteQuery` + `hasNext` 필드 연동 |
| API Mocking | MSW v2 | requirement.md 언급. 서비스 워커 기반 → 실제 axios 코드 그대로 동작 |
| 폼 관리 | react-hook-form + zod | 이메일·비밀번호 복합 유효성 검증 필수. 런타임 검증 + TypeScript 타입 동시 표현 |
| 라우팅 | TanStack Router v1 | 라우트·서치 파라미터 TypeScript 완전 추론. TanStack 생태계 일관성 |
| 클라이언트 상태 | Zustand v5 | auth 토큰용 단순 전역 상태. 보일러플레이트 최소 |
| HTTP 클라이언트 | axios | Bearer 인증 + 401 → refresh → 재시도 패턴을 인터셉터로 구현 |
| 번들러 | Vite 6 | React SPA 표준. CRA deprecated, Next.js는 SSR 불필요 |
| 아이콘 | lucide-react | requirement.md "아이콘 항목별 중복 없이" 명시. tree-shakeable, 스타일 일관 |
| 날짜 포맷 | date-fns | ISO 8601 → `yyyy.MM.dd HH:mm` 변환. tree-shakeable |
| 토스트 | sonner | 5xx 오류 알림용 경량 라이브러리 |
| 패키지 매니저 | npm | Node.js 기본 내장. 리뷰어 즉시 실행 가능 |
| 아키텍처 | FSD (Feature-Sliced Design) | 도메인·기능 단위 분리가 자연스럽게 FSD 6레이어에 부합 |

---

## 2. 폴더 구조 — FSD (Feature-Sliced Design)

FSD 아키텍처를 적용한다.
레이어 간 의존 방향은 단방향: `app → pages → widgets → features → entities → shared`.
상위 레이어가 하위 레이어를 참조할 수 있으나, 역방향 참조는 금지한다.

```
src/
├── app/                          # 앱 초기화: providers, router 등록, 전역 스타일
│   ├── providers/
│   │   └── index.tsx             # QueryClientProvider, RouterProvider 조합
│   ├── router/
│   │   ├── index.tsx             # TanStack Router routeTree 생성
│   │   └── routes/               # 라우트 파일 (파일 기반 라우팅)
│   └── styles/
│       └── global.css            # 폰트 임포트, 리셋
│
├── pages/                        # 라우트 단위 페이지 조합 (UI 조합만, 로직 없음)
│   ├── dashboard/
│   │   └── index.tsx
│   ├── sign-in/
│   │   └── index.tsx
│   ├── task-list/
│   │   └── index.tsx
│   ├── task-detail/
│   │   └── index.tsx
│   └── user/
│       └── index.tsx
│
├── widgets/                      # 독립적으로 동작하는 복합 UI 블록
│   ├── app-layout/               # GNB + LNB 레이아웃
│   │   ├── ui/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── GNB.tsx
│   │   │   └── LNB.tsx
│   │   └── index.ts
│   └── task-virtual-list/        # 가상 스크롤 + 무한 스크롤 목록 위젯
│       ├── ui/
│       │   └── TaskVirtualList.tsx
│       └── index.ts
│
├── features/                     # 사용자 인터랙션 단위 비즈니스 액션
│   ├── auth/                     # 로그인, 토큰 갱신
│   │   ├── ui/
│   │   │   ├── SignInForm.tsx
│   │   │   └── ErrorModal.tsx
│   │   ├── model/
│   │   │   ├── useSignIn.ts
│   │   │   └── signInSchema.ts   # zod 스키마
│   │   └── index.ts
│   └── task-delete/              # 할 일 삭제 확인 플로우
│       ├── ui/
│       │   └── DeleteConfirmModal.tsx
│       ├── model/
│       │   └── useDeleteTask.ts
│       └── index.ts
│
├── entities/                     # 비즈니스 엔티티: 타입, API 호출, 캐시 키
│   ├── task/
│   │   ├── api/
│   │   │   ├── getTasks.ts
│   │   │   ├── getTaskDetail.ts
│   │   │   └── deleteTask.ts
│   │   ├── model/
│   │   │   └── types.ts          # TaskItem, TaskDetailResponse
│   │   ├── ui/
│   │   │   └── TaskCard.tsx
│   │   └── index.ts
│   ├── user/
│   │   ├── api/
│   │   │   └── getUser.ts
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   └── dashboard/
│       ├── api/
│       │   └── getDashboard.ts
│       ├── model/
│       │   └── types.ts
│       ├── ui/
│       │   └── DashboardMetricCard.tsx
│       └── index.ts
│
└── shared/                       # 도메인 비종속 재사용 코드
    ├── api/
    │   ├── apiClient.ts          # axios 인스턴스 + 인터셉터
    │   ├── queryClient.ts        # TanStack Query 클라이언트
    │   └── queryKeys.ts          # 전체 Query Key 중앙 관리
    ├── ui/                       # 공통 컴포넌트
    │   ├── Button/
    │   ├── Input/
    │   ├── Modal/
    │   ├── Card/
    │   ├── EmptyState/
    │   └── LoadingSpinner/
    ├── store/
    │   └── authStore.ts          # Zustand auth 스토어
    ├── lib/
    │   ├── cn.ts                 # clsx + tailwind-merge 래퍼
    │   ├── formatDate.ts         # date-fns 래퍼
    │   └── logger.ts             # 클라이언트 로깅 유틸
    └── config/
        └── env.ts                # import.meta.env 타입 안전 래퍼

src/mocks/                        # MSW 핸들러 (FSD 레이어 외부, src/ 직속)
├── browser.ts                    # 브라우저용 서비스 워커 설정
├── server.ts                     # Node 환경(테스트)용 서버 설정
└── handlers/
    ├── index.ts       # 개별 핸들러 합산 export
    ├── auth.ts
    ├── dashboard.ts
    ├── task.ts
    └── user.ts
```

### FSD 레이어별 역할 요약

| 레이어 | 역할 | 이 프로젝트 예시 |
|--------|------|-----------------|
| `app` | 앱 전체 초기화 | Router, QueryClient Provider |
| `pages` | 라우트 조합 | 대시보드 페이지 = widget + entity 조합 |
| `widgets` | 독립 UI 블록 | AppLayout, TaskVirtualList |
| `features` | 사용자 액션 | 로그인, 삭제 확인 |
| `entities` | 비즈니스 모델 | Task, User, Dashboard 타입/API/카드 |
| `shared` | 기반 코드 | axios, Zustand, Button, Input |

---

## 3. 라우팅 전략 — TanStack Router

TanStack Router의 파일 기반 라우트를 사용한다.
`src/app/router/routes/` 디렉토리의 파일 구조가 라우트 트리로 자동 생성된다.

```
src/app/router/routes/
├── __root.tsx           # 루트 레이아웃 (AppLayout 마운트)
├── index.tsx            # / → Dashboard
├── sign-in.tsx          # /sign-in → SignIn (인증 불필요)
├── task/
│   ├── index.tsx        # /task → TaskList
│   └── $id.tsx          # /task/:id → TaskDetail
└── user.tsx             # /user → UserProfile
```

**인증 보호:** TanStack Router의 `beforeLoad`를 루트 라우트에서 사용.

```ts
// __root.tsx (개념 구조 — 실제 구현 파일 참고)
export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      // 쿠키(token)가 있으면 silent refresh 시도
      await attemptSilentRefresh();
    }
    const tokenAfterRefresh = useAuthStore.getState().accessToken;
    if (!tokenAfterRefresh && location.pathname !== '/sign-in') {
      throw redirect({ to: '/sign-in', search: { redirect: location.pathname } });
    }
  },
});
```

로그인 성공 후 `search.redirect` 파라미터가 있으면 원래 경로로, 없으면 `/`로 이동.

---

## 4. 스타일링 전략 — TailwindCSS v3

요구사항("색상은 토큰으로 관리")을 TailwindCSS `theme.extend`로 충족한다.
컴포넌트는 하드코딩된 색상값 대신 Tailwind 토큰 클래스만 사용한다.

색상 토큰 정의, 타이포그래피 스케일, 스페이싱, 아이콘, 레이아웃 규격 등 전체 디자인 시스템은 `docs/design/DESIGN.md` 참고.

사용 예: `className="bg-primary text-white hover:bg-primary-hover disabled:bg-disabled-bg"`

---

## 5. 인증 흐름

```
[로그인]
  POST /api/sign-in
    → 200: accessToken → authStore, refreshToken → document.cookie (token)
    → 400: errorMessage 모달

[인증 요청 흐름]
  axios 요청
    → 401 응답 감지 (인터셉터)
    → POST /api/refresh (쿠키 token 자동 전송)
      → 200: 새 accessToken → authStore, 새 refreshToken → document.cookie (token) → 원래 요청 재시도
      → 401/400: 토큰 초기화 → document.cookie token 삭제 → /sign-in 리다이렉트

[로그아웃]
  authStore 초기화 → document.cookie token 삭제 → /sign-in 이동
```

<!-- [프로덕션 주석]
실제 환경에서는:
- refreshToken을 HttpOnly; Secure; SameSite=Strict 쿠키로 서버가 내려줌
- /api/refresh 호출 시 credentials: 'include'만으로 처리됨
- accessToken은 메모리(store)에만 보관, 페이지 새로고침 시 자동 refresh 엔드포인트 호출로 복구
- 현재 구현에서는 JS document.cookie(token)에 refreshToken 저장 (HttpOnly 미설정, MSW 환경에서 동일 흐름 시뮬레이션)
-->

---

## 6. 서버 상태 캐싱 전략

Query Key별 staleTime·gcTime 설정 및 invalidation 규칙은 `docs/architecture/STATE.md` 참고.

---

## 7. MSW 활성화 전략

```ts
// app/providers/index.tsx
if (import.meta.env.VITE_USE_MOCK === 'true') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

<!-- [프로덕션 주석]
빌드 시 VITE_USE_MOCK=false → MSW 코드가 번들에 포함되지 않도록 tree-shaking 확인 필요.
-->

---

품질 가이드라인(렌더링 성능 최적화, 웹뷰/인앱 브라우저 대응, 클라이언트 로깅)은 `docs/design/QUALITY.md` 참고.
