# Component Spec

공통 컴포넌트는 `src/shared/ui/`에 위치 (FSD shared 레이어).
도메인 컴포넌트는 `src/entities/{domain}/ui/` 또는 `src/features/{feature}/ui/`에 위치.

**접근성 원칙 (WCAG 2.1 AA 기준):**
모든 컴포넌트는 WCAG 2.1 AA 기준을 충족한다.

---

## shared/ui — 공통 컴포넌트

### Button

```ts
interface ButtonProps {
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  'aria-label'?: string; // 아이콘 전용 버튼에 필수
}
```

| variant | 용도 | Tailwind 토큰 클래스 |
|---------|------|---------------------|
| `primary` | 기본 CTA | `bg-primary text-white hover:bg-primary-hover` |
| `danger` | 삭제 확인 | `bg-error text-white` |
| `ghost` | 보조 액션 | `text-text-secondary border border-border` |

**접근성:**
- `disabled` 또는 `isLoading` 상태일 때 `aria-disabled="true"` + `disabled` 속성 모두 설정.
- `isLoading` 상태일 때 `aria-busy="true"`, 스피너에 `aria-label="로딩 중"`.
- 아이콘만 있는 버튼은 반드시 `aria-label` 필수.

---

### Input

```ts
interface InputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string; // 선택적 도움말 텍스트
}
```

**접근성:**
- `<label htmlFor={id}>` 연결 필수 (명시적 연결, `aria-label`로 대체 불가).
- `error` 있을 때: `aria-invalid="true"` + `aria-describedby="{id}-error"`.
- `hint` 있을 때: `aria-describedby="{id}-hint"` (error와 함께 있으면 둘 다 연결: `"{id}-hint {id}-error"`).
- 에러 메시지: `<p id="{id}-error" role="alert">` — `role="alert"`으로 스크린 리더 즉시 읽기.
- `password` 타입: 표시/숨김 토글 버튼 포함, 토글 버튼 `aria-label`은 현재 상태에 따라 "비밀번호 표시" / "비밀번호 숨기기".

---

### Modal

```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**접근성:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{modal-id}-title"`.
- 열릴 때 최초 포커스는 모달 내 첫 번째 포커서블 요소 또는 닫기 버튼.
- 닫힐 때 모달을 열었던 트리거 요소로 포커스 반환.
- **포커스 트랩**: Tab/Shift+Tab이 모달 내에서만 순환.
- ESC 키 → `onClose` 호출.
- Portal(`createPortal`)로 `document.body`에 렌더링.
- 딤 레이어: `aria-hidden="true"` (스크린 리더가 모달 콘텐츠만 읽도록).

#### DeleteConfirmModal

```ts
interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskId: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}
```

- `role="alertdialog"` 사용 (경고성 다이얼로그 — 되돌릴 수 없는 작업).
- 내부 input에 `taskId`와 동일한 값 입력 시 제출 버튼 활성화.
- input label: "삭제를 확인하려면 ID를 입력하세요", `aria-describedby`로 안내문 연결.

#### ErrorModal

```ts
interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}
```

- 로그인 실패 `errorMessage` 표시. `role="alertdialog"` 사용 (경고성 다이얼로그).

---

### Card

```ts
interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

**접근성:**
- `onClick`이 있으면 `<div>` 대신 `<button type="button">` 또는 `role="button"` + `tabIndex={0}`.
- 키보드: Enter, Space 키 → `onClick` 호출.
- `aria-label` 또는 내부 텍스트가 충분히 의미를 전달해야 함.

---

### EmptyState

```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

- `role="status"` 또는 `aria-live="polite"`로 동적으로 삽입될 때 스크린 리더에 알림.

---

### LoadingSpinner

```ts
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}
```

**접근성:**
- `role="status"`, `aria-label={label ?? '로딩 중'}`.
- 스피너 SVG 내부에 `<title>로딩 중</title>` 포함.
- 시각적으로만 표현되는 요소이므로 `aria-hidden="true"` + 별도 `<span className="sr-only">` 조합 가능.

---

접근성 공통 지침(색상 대비, 키보드 내비게이션, 스크린 리더, 폼, 모달, 라우팅, 가상 스크롤, 모션)은 `docs/design/ACCESSIBILITY.md` 참고.

---

## widgets — 복합 UI 블록

### AppLayout (`src/widgets/app-layout/`)

- `<header>`, `<nav>`, `<main>` 등 HTML 랜드마크 요소 사용.
- LNB: `<nav aria-label="주 메뉴">`, `<ul>` + `<li>` 구조.
- 활성 메뉴: `aria-current="page"`.

### TaskVirtualList (`src/widgets/task-virtual-list/`)

- 가상화 컨테이너에 `role="list"`, 각 아이템에 `role="listitem"`.
- 스크롤 로딩 중 하단 sentinel에 `aria-label="다음 항목 불러오는 중"` LoadingSpinner 표시.

---

## entities — 도메인 컴포넌트

### TaskCard (`src/entities/task/ui/TaskCard.tsx`)

```ts
interface TaskCardProps {
  id: string;
  title: string;
  memo: string;
  status: 'TODO' | 'DONE';
  onClick: (id: string) => void;
}
```

- `<button type="button">` 기반 — 키보드 접근 및 클릭 이벤트 자동 지원.
- `aria-label={title}` 또는 내부 텍스트로 충분한 설명 제공.
- 고정 높이 96px. 가상 스크롤 `estimateSize`는 104px (카드 96px + 하단 갭 8px).
- `status === 'DONE'`: `text-success` / `status === 'TODO'`: `text-text-primary` (DESIGN.md §10 참고).

### DashboardMetricCard (`src/entities/dashboard/ui/DashboardMetricCard.tsx`)

```ts
interface DashboardMetricCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode; // 자의적 결정: 아이콘 미사용 시 생략 가능
}
```

- 아이콘: `aria-hidden="true"` (레이블 텍스트가 의미 전달).
- 숫자: `<strong>` 또는 `aria-label="{label}: {value}건"` 조합.

---

## features — 사용자 액션 컴포넌트

### SignInForm (`src/features/auth/ui/SignInForm.tsx`)

- react-hook-form + zod 사용.
- `formState.isValid`가 `true`일 때만 제출 버튼 활성화.
- 제출 중: `aria-busy="true"`, 버튼 `isLoading=true`.
- 실패 시 `ErrorModal` 열기 + `aria-live="assertive"` 영역에 에러 알림.
- `<form>` 요소에 `noValidate` (브라우저 기본 유효성 팝업 비활성화, 커스텀 UI 사용).
