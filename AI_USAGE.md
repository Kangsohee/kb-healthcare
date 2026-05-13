# AI 활용 내역

## 사용한 도구/모델

| 항목 | 내용 |
|------|------|
| 도구 | Claude Code (Anthropic) |
| 모델 | claude-sonnet-4-6 |
| 활용 방식 | 대화형 에이전트 — 파일 생성·수정, 요구사항 검증, 코드 구현·디버깅 |

---

## 적용한 작업 범위

AI(Claude Code)가 아래 모든 소스 파일을 생성·수정했습니다.

### 사전 설계 문서 (`docs/`)

요구사항·OpenAPI 명세를 기반으로 설계 문서 전체를 작성하고 파일 간 교차 검증을 4회 수행했습니다.

| 문서 | 내용 |
|------|------|
| `docs/product/PRD.md` | 기능 요구사항, 라우트 구조, 페이지별 동작 규칙 |
| `docs/product/SCREENS.md` | 전 페이지 ASCII 와이어프레임 |
| `docs/product/DEV_SPEC.md` | 페이지·기능 단위 컴포넌트·API·상태·에러 처리 명세 |
| `docs/architecture/ARCHITECTURE.md` | 기술 스택 결정, FSD 폴더 구조, 라우팅 전략, 인증 흐름 |
| `docs/architecture/COMPONENTS.md` | 공통·도메인 컴포넌트 인터페이스 및 접근성 명세 |
| `docs/architecture/API.md` | 엔드포인트 스키마, 에러 처리, MSW 핸들러 구조 |
| `docs/architecture/STATE.md` | Query Key 팩토리, staleTime/gcTime, Zustand authStore |
| `docs/design/DESIGN.md` | 색상 토큰, 타이포그래피, 스페이싱, 아이콘 가이드 |
| `docs/design/ACCESSIBILITY.md` | WCAG 2.1 AA 접근성 패턴 |
| `docs/design/QUALITY.md` | 렌더링 성능, 웹뷰 대응, 클라이언트 로깅 구조 |
| `docs/dev/CONVENTIONS.md` | FSD 의존 규칙, 스타일링, TypeScript, API 호출 규칙 |
| `docs/dev/TESTING.md` | 테스트 도구, 우선순위별 케이스, MSW 설정 |
| `docs/dev/IMPLEMENTATION_PLAN.md` | Phase 구현 순서 |

### 공통 인프라 (`src/shared/`)

| 파일 | 내용 |
|------|------|
| `api/apiClient.ts` | axios 인스턴스 + Bearer 주입 + 401→refresh→재시도 인터셉터 (큐 기반 동시 요청 처리), refresh token을 쿠키 `token`으로 관리 (OpenAPI 스펙 준수) |
| `api/queryClient.ts` | TanStack Query QueryClient 기본 옵션 |
| `api/queryKeys.ts` | Query Key 팩토리 (dashboard, tasks.all/list/detail, user) |
| `store/authStore.ts` | Zustand v5 인증 스토어 (accessToken, setAccessToken, clearAuth) |
| `lib/cn.ts` | clsx + tailwind-merge 유틸 |
| `lib/formatDate.ts` | date-fns `registerDatetime` 포맷 래퍼 |
| `lib/logger.ts` | 클라이언트 로깅 유틸 |
| `lib/usePageTitle.ts` | 라우트별 `<title>` 업데이트 훅 |
| `config/env.ts` | `import.meta.env` 타입 안전 래퍼 |

### 공통 UI (`src/shared/ui/`)

| 파일 | 내용 |
|------|------|
| `Button.tsx` | variant(primary/danger/ghost), `enabled:hover:` / `enabled:active:` 로 비활성화 시 원본 텍스트·색상 유지, isLoading 스피너 |
| `Input.tsx` | label/htmlFor 연결, error aria-describedby, password 토글, forwardRef |
| `Modal.tsx` | role=dialog/alertdialog, 포커스 트랩, ESC 닫기, Portal, `animate-scale-in` / `animate-fade-in` 진입 애니메이션 |
| `EmptyState.tsx` | Inbox 아이콘, role=status, aria-live, action 버튼 옵션 |
| `LoadingSpinner.tsx` | role=status, sr-only 텍스트 |

### MSW 핸들러 (`src/mocks/`)

| 파일 | 내용 |
|------|------|
| `handlers/auth.ts` | POST /api/sign-in (400 + errorMessage), POST /api/refresh (쿠키 `token` 검증) |
| `handlers/dashboard.ts` | GET /api/dashboard (task.ts 집계값 동적 참조) |
| `handlers/task.ts` | GET /api/task (페이지네이션), GET /api/task/:id, DELETE /api/task/:id — 헬스케어 테마 200개 목 데이터 (20개 템플릿 순환, 순번 제목) |
| `handlers/user.ts` | GET /api/user |
| `browser.ts` / `server.ts` | 브라우저 워커·Node 서버 설정 |

### 엔티티 (`src/entities/`)

| 파일 | 내용 |
|------|------|
| `task/` | TaskItem·TaskListResponse·TaskDetailResponse·DeleteTaskResponse 타입; getTasks·getTaskDetail·deleteTask API 함수; useTasks(useInfiniteQuery)·useTaskDetail 훅; TaskCard UI |
| `dashboard/` | DashboardResponse 타입; getDashboard API; useDashboard 훅; DashboardMetricCard 컴포넌트 |
| `user/` | UserResponse 타입; getUser API; useUser 훅 |

### 기능 (`src/features/`)

| 파일 | 내용 |
|------|------|
| `auth/model/signInSchema.ts` | zod 스키마 (email, password 영문·숫자 8~24자) |
| `auth/model/useSignIn.ts` | useMutation + 로그인 성공 시 쿠키 `token` 저장 |
| `auth/ui/SignInForm.tsx` | react-hook-form + zodResolver, isValid 기반 버튼 활성화, label 연결 |
| `auth/ui/ErrorModal.tsx` | role=alertdialog, errorMessage 표시 |
| `task-delete/model/useDeleteTask.ts` | DELETE mutation + 쿼리 무효화 + /task 이동 |
| `task-delete/ui/DeleteConfirmModal.tsx` | ID 입력 일치 시 제출 버튼 활성화, role=alertdialog |

### 위젯 (`src/widgets/`)

| 파일 | 내용 |
|------|------|
| `app-layout/ui/GNB.tsx` | sticky 헤더, 인증 상태 분기 (UserCircle / LogIn), HeartPulse 브랜드 아이콘 |
| `app-layout/ui/LNB.tsx` | 태블릿(768px~)에서 아이콘 전용, 데스크톱(1024px~)에서 전체 텍스트 표시, aria-current |
| `app-layout/ui/BottomNav.tsx` | 모바일(<768px) 하단 고정 내비게이션, aria-current |
| `app-layout/ui/AppLayout.tsx` | GNB + LNB + BottomNav + main 반응형 레이아웃 |
| `task-virtual-list/ui/TaskVirtualList.tsx` | useVirtualizer(estimateSize:104, overscan:3) + IntersectionObserver 무한 스크롤 |

### 페이지 (`src/pages/`)

| 파일 | 내용 |
|------|------|
| `dashboard/DashboardPage.tsx` | 대시보드 3개 지표 카드 (일/해야할 일/한 일), 아이콘 3종 구분 |
| `sign-in/SignInPage.tsx` | 로그인 폼, 브랜드 헤더 |
| `task-list/TaskListPage.tsx` | 가상 스크롤 + 무한 스크롤 목록 |
| `task-detail/TaskDetailPage.tsx` | 상세 정보, 삭제 모달, 404 처리 |
| `user/UserPage.tsx` | 회원정보 표시 |

### 라우팅 (`src/app/router/`)

| 파일 | 내용 |
|------|------|
| `routes/__root.tsx` | beforeLoad 인증 가드, 쿠키 기반 무음 리프레시, catch-all 404 (`notFoundComponent`) |
| 각 라우트 파일 | `/`, `/sign-in`, `/task`, `/task/:id`, `/user` |

### 스타일 (`src/app/styles/global.css`)

Pretendard 폰트, focus-visible 전역, `prefers-reduced-motion` 대응, 웹킷 커스텀 스크롤바

### 빌드 설정

`tailwind.config.ts` — 색상 토큰 14종, `scale-in` / `fade-in` 키프레임 애니메이션

### 정적 파일

`public/favicon.svg` — 브랜드 색상(#0046B4) + HeartPulse 아이콘 SVG, `index.html` apple-touch-icon 포함

### 테스트 (`src/**/__tests__/`)

| 파일 | 케이스 수 |
|------|---------|
| `shared/ui/__tests__/Button.test.tsx` | 5 |
| `shared/ui/__tests__/Input.test.tsx` | 5 |
| `shared/ui/__tests__/Modal.test.tsx` | 6 |
| `shared/ui/__tests__/EmptyState.test.tsx` | 3 |
| `shared/ui/__tests__/LoadingSpinner.test.tsx` | 4 |
| `features/auth/__tests__/SignInForm.test.tsx` | 5 |
| `features/task-delete/__tests__/DeleteConfirmModal.test.tsx` | 7 |
| `entities/task/__tests__/useTasks.test.tsx` | 3 |
| `widgets/app-layout/__tests__/LNB.test.tsx` | 4 |
| `widgets/task-virtual-list/__tests__/TaskVirtualList.test.tsx` | 4 |
| `shared/api/apiClient.test.ts` | 2 |
| **합계** | **49** |

---

## 핵심 프롬프트 요약

| 목적 | 프롬프트 요약 |
|------|-------------|
| 사전 문서 작성 | "요구사항과 OpenAPI 명세를 기반으로 FSD 아키텍처 설계 문서, 컴포넌트 명세, 상태 관리 전략, 테스트 전략을 작성해줘" |
| 문서 교차 검증 | "전체 docs 파일을 타입 불일치·함수 시그니처·용어 불일치 등 12가지 관점에서 교차 검증하고 이슈가 없어질 때까지 수정해줘" |
| 코드 구현 | "Phase N 시작합니다. IMPLEMENTATION_PLAN의 해당 Phase 순서대로 파일을 생성·수정해줘" |
| UI/UX 개선 | "비활성화 버튼이 🚫 커서 대신 원본 텍스트를 유지하면서 opacity만 낮아지게 해줘", "뱃지를 카드 우측에서 위아래 가운데 정렬로 바꿔줘" |
| 반응형 구현 | "모바일에서 하단 내비게이션, 태블릿에서 아이콘 전용 사이드바, 데스크톱에서 전체 사이드바로 3단계 반응형을 구현해줘" |
| 스펙 검증 | "requirement.md와 openapi.yaml 두 파일을 보고 지금까지 개발한 게 오버개발은 없는지, 파일 간 정합성과 충돌하는 부분은 없는지 검증해줘" |
| 목 데이터 | "헬스케어 테마에 맞는 현실적인 할 일 200개를 순번 포함해서 목 데이터로 넣어줘" |

---

## 사람이 최종 검증한 내용

- 요구사항 및 OpenAPI 명세 해석과 구현 방향 검토·확정
- 기술 스택 선택(TanStack Router, TanStack Query, Zustand, MSW, Vitest) 최종 승인
- 단계별 구현 완료 후 브라우저에서 직접 동작 확인
  - 로그인·로그아웃 흐름
  - 무한 스크롤 체감 (200개 목 데이터로 직접 테스트)
  - 할 일 상세 페이지 내용 확인
  - 삭제 모달 동작 확인
- 대시보드 아이콘 3종이 서로 구분되는지 시각 검토
- 비활성화 버튼 UX (opacity 처리) 결과 검토
- 뱃지 위아래 가운데 정렬 결과 검토
- 반응형 레이아웃 동작 검토
- 요구사항 대비 오버개발 여부 판단 (탭 분리 기능은 요구사항 외로 제외 결정)
- OpenAPI 스펙 대비 구현 정합성 최종 확인
- 전체 코드 최종 검토

---

## 선택 제출 항목

### 계획 문서

`docs/` 폴더 전체가 AI와 함께 작성한 설계 문서이며, 프로젝트에 포함되어 있습니다.
