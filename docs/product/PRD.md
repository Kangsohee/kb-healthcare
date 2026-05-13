# KB헬스케어 프론트엔드 과제 — PRD

## 1. 개요

KB헬스케어 프론트엔드 개발자 채용 과제로, 할 일 관리 SPA(Single Page Application)를 구현한다.
로그인/인증, 대시보드, 할 일 목록·상세, 회원정보 페이지로 구성된다.

---

## 2. 기술 스택

| 항목 | 결정 사항 | 근거 |
|------|-----------|------|
| 프레임워크 | React 18 + TypeScript 5 | requirement.md 필수 명시: "React@18/19와 typescript를 사용해주세요" |
| 폰트 | Pretendard | requirement.md 필수 명시: "폰트는 pretendard를 사용해주세요" |
| 색상 관리 | TailwindCSS `theme.extend` 토큰 | requirement.md 필수 명시: "색상은 토큰으로 관리되어야 합니다". `theme.extend.colors`로 구현 시 TypeScript 자동완성 지원 |
| 가상 스크롤 | @tanstack/react-virtual v3 | requirement.md 필수 명시: "가상 스크롤링". TanStack Query와 동일 생태계, 동적 높이 지원 |
| 무한 스크롤 | TanStack Query `useInfiniteQuery` | requirement.md 필수 명시: "무한 스크롤". openapi.yaml의 `hasNext: boolean` 필드를 `getNextPageParam`에 직결 |
| API Mocking | MSW v2 | requirement.md 언급: "MSW 등 익숙하신 방법으로 처리". 서비스 워커 기반으로 axios 인터셉터 등 실제 코드가 그대로 동작 |
| 폼 관리 | react-hook-form + zod | requirement.md: 이메일·비밀번호 유효성 및 버튼 활성화 조건 필수. openapi.yaml: `format: email`, `pattern: '^[A-Za-z0-9]+$'` (8~24자) — zod로 런타임 검증·TypeScript 타입 동시 표현 |
| 아이콘 | lucide-react | requirement.md 명시: "아이콘은 항목별로 겹치지 않게 지정". tree-shakeable하고 아이콘 간 선 굵기·스타일 일관 |
| 라우팅 | TanStack Router v1 | openapi.yaml의 `/api/task/{id}` 경로 파라미터를 TypeScript로 완전 추론. TanStack 생태계와 일관성 확보 |
| 서버 상태 | TanStack Query v5 | requirement.md의 무한 스크롤·캐싱 요구. openapi.yaml의 `hasNext` 필드를 `getNextPageParam`으로 처리 |
| 클라이언트 상태 | Zustand v5 | openapi.yaml `AuthTokenResponse`의 accessToken을 앱 전역 유지. 단순한 구조에 Redux 대비 보일러플레이트 최소 |
| HTTP 클라이언트 | axios | openapi.yaml의 `bearerAuth` 스키마(Authorization 헤더) + `refreshTokenCookie` 401 재시도 패턴을 인터셉터로 구현 |
| 아키텍처 | FSD (Feature-Sliced Design) | requirement.md의 도메인(task, user, dashboard)·기능(로그인, 삭제)이 명확히 분리 → FSD 레이어에 자연스럽게 맞음 |
| 빌드 | Vite 6 | React SPA 표준 빌드 도구. CRA deprecated, Next.js는 SSR 불필요 |
| 패키지 매니저 | npm | Node.js 기본 내장. 과제 규모에서 별도 설치 불필요, 리뷰어가 즉시 실행 가능 |

---

## 3. 디자인 시스템

색상 토큰, 타이포그래피, 스페이싱, 레이아웃 규격, 아이콘, 반응형 브레이크포인트 등 전체 디자인 시스템은 `docs/design/DESIGN.md` 참고.

---

## 4. 라우트 구조

| 경로 | 페이지 | 인증 필요 |
|------|--------|-----------|
| `/` | 대시보드 | O |
| `/sign-in` | 로그인 | X |
| `/task` | 할 일 목록 | O |
| `/task/:id` | 할 일 상세 | O |
| `/user` | 회원정보 | O |

- 인증이 필요한 라우트에 미인증 접근 시 `/sign-in`으로 리다이렉트한다.
- 로그인 성공 후 `/`(대시보드)로 리다이렉트한다.

---

## 5. 레이아웃 — GNB / LNB

### 5.1 구조

```
┌─────────────────────────────────────────────┐
│  GNB (상단 고정 헤더)                        │
├──────────┬──────────────────────────────────┤
│  LNB     │  콘텐츠 영역                      │
│ (사이드바)│                                  │
└──────────┴──────────────────────────────────┘
```

### 5.2 LNB 메뉴 항목

| 항목 | 아이콘 | 이동 경로 |
|------|--------|-----------|
| 대시보드 | `LayoutDashboard` (lucide) | `/` |
| 할 일 | `CheckSquare` (lucide) | `/task` |

### 5.3 GNB 로그인 상태

| 상태 | 아이콘 | 동작 |
|------|--------|------|
| 로그인됨 | `UserCircle` (lucide) | `/user`로 이동 |
| 미로그인 | `LogIn` (lucide) | `/sign-in`으로 이동 |

---

## 6. 페이지 상세 요구사항

### 6.1 대시보드 (`/`)

**API:** `GET /api/dashboard` (Bearer 인증 필요)

| UI 요소 | 표시 데이터 | API 필드 |
|---------|-------------|----------|
| 일 | 전체 할 일 수 | `numOfTask` |
| 해야할 일 | 미완료 할 일 수 | `numOfRestTask` |
| 한 일 | 완료 할 일 수 | `numOfDoneTask` |

- 카드 3개를 가로로 나열한다 (자의적 결정).
- 401 응답 시 `/sign-in`으로 리다이렉트한다.

---

### 6.2 로그인 (`/sign-in`)

**API:** `POST /api/sign-in`

#### 폼 필드

| 필드 | 레이블 | 유효성 규칙 | 필수 |
|------|--------|-------------|------|
| email | 이메일 | RFC 5322 이메일 형식 | O |
| password | 비밀번호 | 영문+숫자, 8~24자 (`^[A-Za-z0-9]{8,24}$`) | O |

#### 동작 규칙

- 제출 버튼은 모든 필드가 유효할 때만 활성화, 그 외 비활성화(`disabled`).
- 각 input에 `<label>` 요소가 명시적으로 연결되어야 한다.
- 유효성 검증 실패 시 해당 input 하단에 에러 메시지를 표시한다.
- API 응답 상태 코드가 200이 아닌 경우, `errorMessage`를 표시하는 모달을 노출한다.
- 성공 시 `accessToken`을 저장하고 `/`로 이동한다.

#### 인증 토큰 처리

- `accessToken`: 메모리(Zustand 스토어)에 저장. 페이지 새로고침 시 소멸 → 앱 마운트 시 `POST /api/refresh`로 복구.
  - > **[프로덕션 주석]** 실제 환경에서는 `accessToken`을 `localStorage`에 저장하는 방식은 XSS 취약점 노출 위험이 있어 지양한다. 메모리 저장 + silent refresh 패턴을 권장한다.
- `refreshToken`: `document.cookie`에 `token=...; path=/; SameSite=Strict` 형태로 저장한다.
  - > **[프로덕션 주석]** 실제 환경에서는 서버가 `Set-Cookie: HttpOnly; Secure; SameSite=Strict`로 refreshToken을 내려줘야 한다. 현재는 JS에서 직접 쓰는 방식으로 동일 흐름을 시뮬레이션한다.

---

### 6.3 할 일 목록 (`/task`)

**API:** `GET /api/task?page={n}` (Bearer 인증 필요)

#### 카드 표시 항목

- `title`
- `memo`
- `status` (`TODO` / `DONE`) — requirement.md는 title·memo만 명시. openapi.yaml `TaskItem`에 status 필드가 있어 카드에 함께 표시 (자의적 결정)

#### 렌더링 전략

| 기능 | 구현 방식 |
|------|-----------|
| 가상 스크롤링 | TanStack Virtual (`@tanstack/react-virtual`) |
| 무한 스크롤 | `IntersectionObserver`로 목록 하단 감지 → 다음 페이지 API 호출 |
| 다음 페이지 존재 여부 | `hasNext: boolean` 필드 기준 |

- 각 카드 클릭 시 `/task/:id`로 이동한다.
- 401 응답 시 토큰 갱신 시도 후 실패하면 `/sign-in`으로 리다이렉트한다.

---

### 6.4 할 일 상세 (`/task/:id`)

**API:** `GET /api/task/:id` (Bearer 인증 필요)

#### 표시 항목

- `title`
- `memo`
- `registerDatetime` (날짜 포맷: `yyyy.MM.dd HH:mm` — 자의적 결정, date-fns 포맷 토큰 기준)

#### 404 처리

- 404 응답 시 "리소스를 찾을 수 없습니다." 화면을 노출한다.
- 목록으로 돌아가는 버튼(`/task`로 이동)을 포함한다.

#### 삭제 기능

**API:** `DELETE /api/task/:id`

1. 삭제 버튼 클릭 → 확인 모달 노출.
2. 모달 내 input에 해당 `id`와 동일한 값을 입력해야 제출 버튼 활성화.
3. 값이 일치하지 않으면 제출 버튼 비활성화.
4. 제출 성공 시 `/task`로 리다이렉트.

---

### 6.5 회원정보 (`/user`)

**API:** `GET /api/user` (Bearer 인증 필요)

| 표시 항목 | API 필드 |
|-----------|----------|
| 이름 | `name` |
| 메모 | `memo` |

---

## 7. 인증 흐름

```
accessToken 만료 감지 (401 응답)
  └─> POST /api/refresh (쿠키 token 자동 전송)
        ├─> 200: 새 accessToken 저장 → 원래 요청 재시도
        └─> 401/400: 로컬 토큰 초기화 → /sign-in 리다이렉트
```

구현 세부사항(axios 인터셉터, 토큰 저장 전략)은 `docs/architecture/ARCHITECTURE.md` 섹션 5 참고.

---

## 8. API Mocking 전략 (MSW v2)

MSW 핸들러 구조, 서비스 워커 등록, `VITE_USE_MOCK` 플래그 활성화 방법은 `docs/architecture/ARCHITECTURE.md` 섹션 7 및 `docs/setup/SETUP.md` 참고.

---

## 9. 에러 처리 정책

HTTP 상태 코드별 처리 규칙은 `docs/architecture/API.md` 에러 처리 공통 규칙 참고.

---

## 10. 폴더 구조 — FSD (Feature-Sliced Design)

상세 구조는 `docs/architecture/ARCHITECTURE.md` 참고.

```
src/
├── app/        # 앱 초기화 (providers, router, global styles)
├── pages/      # 라우트 단위 페이지 조합
├── widgets/    # 독립 복합 UI 블록 (AppLayout, TaskVirtualList)
├── features/   # 사용자 액션 단위 (auth, task-delete)
├── entities/   # 비즈니스 엔티티 (task, user, dashboard)
└── shared/     # 재사용 기반 코드 (ui, api, store, lib)
```

---

## 11. 주요 구현 파일 위치 (FSD 기준)

| 항목 | 라이브러리 | 구현 위치 |
|------|-----------|-----------|
| 가상 스크롤 | `@tanstack/react-virtual` | `src/widgets/task-virtual-list/ui/TaskVirtualList.tsx` |
| HTTP 클라이언트 | `axios` | `src/shared/api/apiClient.ts` |
| 날짜 포맷 | `date-fns` | `src/shared/lib/formatDate.ts` |
| 아이콘 | `lucide-react` | `src/widgets/app-layout/ui/GNB.tsx`, `LNB.tsx` |
| 토스트 | `sonner` | `src/app/providers/index.tsx` |
| 폼 관리 | `react-hook-form` + `zod` | `src/features/auth/ui/SignInForm.tsx` |
