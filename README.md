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

- **인증 흐름**: 로그인 성공 시 accessToken은 Zustand(메모리), refreshToken은 sessionStorage 보관. 앱 초기화 시 silent refresh로 세션 복구. 401 응답 시 인터셉터가 자동으로 토큰 갱신 후 재시도 (동시 요청은 pending queue로 처리)
- **가상 스크롤**: `useVirtualizer`로 할 일 목록 렌더링. `estimateSize: 96`, `overscan: 3`. IntersectionObserver로 페이지 끝 도달 시 다음 페이지 자동 로드
- **삭제 확인**: task ID를 직접 입력해야 삭제 버튼이 활성화되는 이중 확인 UX
- **접근성**: WCAG 2.1 AA 기준. 모달 포커스 트랩, ESC 닫기, `role="alertdialog"`, `aria-live` 영역, `focus-visible` 전역 스타일
