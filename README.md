# KB헬스케어 채용 과제

React + TypeScript 기반 할 일 관리 SPA

---

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 `http://localhost:5173`에서 시작됩니다. MSW mock API가 자동으로 활성화됩니다.

**테스트 계정**
- 이메일: `user@example.com`
- 비밀번호: `abc12345`

---

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 (MSW 포함) |
| `npm run build` | 프로덕션 빌드 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | 테스트 (watch 모드) |
| `npm run test:run` | 테스트 단일 실행 |
| `npm run test:coverage` | 커버리지 리포트 |

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | React 18 + TypeScript 5 |
| 번들러 | Vite 6 |
| 라우팅 | TanStack Router v1 (파일 기반, 타입 안전) |
| 서버 상태 | TanStack Query v5 (`useInfiniteQuery`) |
| 가상 스크롤 | TanStack Virtual v3 |
| 클라이언트 상태 | Zustand v5 (인증 토큰) |
| HTTP | axios (Bearer 주입 + 401→refresh→retry 인터셉터) |
| 폼 | react-hook-form + zod |
| 스타일 | TailwindCSS v3 (커스텀 색상 토큰) |
| API Mock | MSW v2 (서비스 워커 + Node 서버) |
| 테스트 | Vitest + @testing-library/react |
| 아이콘 | lucide-react |
| 토스트 | sonner |
| 폰트 | Pretendard (@fontsource) |

---

## 아키텍처

FSD (Feature-Sliced Design) 6레이어 단방향 의존:

```
app → pages → widgets → features → entities → shared
```

```
src/
├── app/          # 앱 초기화, 라우터, 전역 스타일
├── pages/        # 라우트 단위 페이지 조합
├── widgets/      # 앱 레이아웃, 가상 스크롤 목록
├── features/     # 로그인 폼, 삭제 확인 모달
├── entities/     # Task / User / Dashboard 도메인 모델 + API Hook
└── shared/       # axios 인스턴스, Query Key 팩토리, UI 공통 컴포넌트
```

---

## 주요 구현

- **인증 흐름**: 로그인 성공 시 accessToken은 Zustand(메모리), refreshToken은 `document.cookie`(`token`) 보관. 앱 초기화 시 silent refresh로 세션 복구. 401 응답 시 인터셉터가 자동으로 토큰 갱신 후 재시도 (동시 요청은 pending queue로 처리)
- **가상 스크롤**: `useVirtualizer`로 할 일 목록 렌더링. `estimateSize: 104` (카드 96px + 하단 갭 8px), `overscan: 3`. IntersectionObserver로 페이지 끝 도달 시 다음 페이지 자동 로드
- **삭제 확인**: task ID를 직접 입력해야 삭제 버튼이 활성화되는 이중 확인 UX
- **접근성**: WCAG 2.1 AA 기준. 모달 포커스 트랩, ESC 닫기, `role="alertdialog"`, `aria-live` 영역, `focus-visible` 전역 스타일
- **할 일 목록 카드 상태 표시** *(자의적 결정)*: 요구사항에는 카드에 `title`과 `memo`만 표시하도록 명시되어 있으나, OpenAPI 명세의 `TaskItem`에 `status` 필드가 포함되어 있어 카드에 `TODO` / `완료` 배지를 함께 노출했습니다. 완료된 항목의 제목에 취소선을 적용한 것도 같은 맥락의 자의적 결정입니다. 다만 목록에서 상태를 노출한 결과, 상세 페이지에서는 동일한 정보가 보이지 않아 일관성이 다소 부족하게 느껴질 수 있습니다. `GET /api/task/:id` 응답에 `status` 필드가 추가된다면 상세 페이지에도 배지를 함께 노출하는 것이 자연스러울 것 같습니다.

---

## 개선 제안 (요구사항 외 자의적 검토)

### 대시보드 — 최근 할 일 미리보기

현재 대시보드는 지표 카드 3개로 구성되어 있어 하단에 빈 공간이 생깁니다. 지표 카드 아래에 최근 할 일 몇 개를 간략히 보여주는 미리보기 섹션을 추가하면 페이지 완성도와 실용성이 높아질 것 같습니다. 요구사항에 포함되지 않아 이번 구현에서는 제외했습니다.

### 할 일 목록 — 상태별 탭 필터

현재는 완료된 항목과 미완료 항목이 하나의 목록에 함께 표시됩니다. "전체 / 해야할 일 / 완료" 형태의 탭을 추가하면 원하는 항목을 더 빠르게 찾을 수 있어 편의성이 높아질 것 같습니다. 요구사항에 포함되지 않아 이번 구현에서는 제외했습니다.

### GNB 로그인 아이콘 동작에 대한 해석

요구사항에 "로그인하지 않은 경우 로그인 아이콘을 표시하고, 클릭 시 로그인 페이지로 전환"이라고 명시되어 있습니다. 현재 앱에서는 비인증 상태의 사용자가 모두 로그인 페이지로 리다이렉트되기 때문에, 이 동작이 실질적으로 사용되는 상황이 발생하지 않습니다. 향후 로그인 없이도 접근 가능한 공개 페이지가 추가된다면 의미 있는 동작이 될 것으로 보여, 요구사항대로 구현해 두었습니다.
