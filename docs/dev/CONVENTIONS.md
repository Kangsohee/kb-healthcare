# Development Conventions

개발 중 반드시 지켜야 할 코딩 규칙과 유의사항.

---

## 1. FSD 레이어 의존 규칙

레이어 간 의존 방향은 **단방향**만 허용: `app → pages → widgets → features → entities → shared`

| 규칙 | 예시 |
|------|------|
| 상위 레이어는 하위 레이어 import 가능 | `features`에서 `entities`, `shared` import ✅ |
| 하위 레이어가 상위 레이어 import 금지 | `entities`에서 `features` import ❌ |
| 같은 레이어 간 cross-import 금지 | `features/auth`에서 `features/task-delete` import ❌ |
| `shared`는 도메인 비종속 | `shared`에서 `entities`, `features` import ❌ |

```ts
// ❌ 잘못된 예: entities에서 features import
import { useDeleteTask } from '@/features/task-delete';

// ✅ 올바른 예: features에서 entities import
import { TaskCard } from '@/entities/task';
```

---

## 2. 스타일링

- **하드코딩 색상값 금지**: `#0046B4`, `rgb(...)` 직접 사용 금지. 반드시 Tailwind 토큰 클래스 사용.

```tsx
// ❌
<button style={{ backgroundColor: '#0046B4' }}>

// ✅
<button className="bg-primary hover:bg-primary-hover">
```

- `className`에서 조건부 스타일은 `clsx` 또는 `cn` 유틸 사용.
- `tailwind.config.ts`에 없는 토큰이 필요하면 토큰을 추가하고 사용 (인라인 값 금지).

---

## 3. TypeScript

- `any` 사용 금지. 불가피한 경우 `unknown` 후 타입 가드.
- API 응답 타입은 `src/entities/{domain}/model/types.ts`에 정의.
- `as` 타입 단언은 최소화. 불가피하면 이유를 주석으로 명시.
- `tsconfig.json` `strict: true` 유지 — 임의로 완화 금지.

---

## 4. 컴포넌트 작성

- **공통 UI**: `src/shared/ui/`에만 배치. 도메인 개념이 없는 순수 UI여야 함.
- **도메인 컴포넌트**: `src/entities/{domain}/ui/` 또는 `src/features/{feature}/ui/`.
- `pages/` 레이어는 UI 조합만 — 직접 API 호출, 비즈니스 로직 금지.
- 클릭 가능한 카드/목록 아이템은 `<div onClick>` 대신 `<button type="button">` 사용.

---

## 5. 접근성 (WCAG 2.1 AA)

상세 기준: `docs/design/ACCESSIBILITY.md`

| 필수 규칙 | 적용 대상 |
|-----------|-----------|
| `aria-hidden="true"` | 모든 lucide 아이콘 |
| `<label htmlFor>` 명시적 연결 | 모든 form input |
| `outline: none` 금지 | 모든 요소 (커스텀 `focus-visible` 사용) |
| `role="alert"` | 에러 메시지 |
| `role="dialog"` / `role="alertdialog"` | 모달 |
| 포커스 트랩 | 모달 열림 상태 |

---

## 6. API 호출

- 컴포넌트에서 직접 `axios` 호출 금지. 반드시 `src/entities/{domain}/api/` 함수를 통해 호출.
- `useQuery` / `useMutation` 훅은 `src/entities/{domain}/` 또는 `src/features/{feature}/model/`에 위치.
- Query Key는 `src/shared/api/queryKeys.ts`에 정의된 팩토리만 사용 — 문자열 직접 사용 금지.

```ts
// ❌
useQuery({ queryKey: ['tasks', 'list'], ... })

// ✅
useQuery({ queryKey: queryKeys.tasks.list(), ... })
```

---

## 7. 에러 처리

- 401 처리는 axios 인터셉터가 담당. 각 컴포넌트에서 중복 처리 금지.
- 예외적 에러(네트워크 오류 등)는 sonner `toast.error()` 사용.
- `try/catch`에서 에러를 무시(`catch {}`)하지 않는다. 반드시 `logger.error` 호출.
- React Error Boundary는 `app` 레이어에서 전역으로 설정.

---

## 8. 로깅

`src/shared/lib/logger.ts`만 사용. `console.log` 직접 사용 금지.

```ts
// ❌
console.log('삭제 성공');

// ✅
logger.info('task deleted', { taskId });
```

로깅 수집 지점: `docs/design/QUALITY.md` §3 참고.

---

## 9. 테스트

- 새 컴포넌트 추가 시 단위 테스트 함께 작성 (우선순위는 `docs/dev/TESTING.md` 참고).
- `console.error`가 테스트 출력에 나오면 경고가 아닌 버그로 간주하고 수정.
- MSW 핸들러를 override할 때는 `afterEach`에서 `server.resetHandlers()` 보장.

---

## 10. 커밋 전 체크리스트

```bash
npm run typecheck   # TypeScript 오류 없음
npm run lint        # ESLint 통과
npm run test:run    # 테스트 전체 통과
```

세 가지 모두 통과한 상태에서만 커밋.
