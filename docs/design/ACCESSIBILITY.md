# Accessibility Guide (WCAG 2.1 AA)

모든 컴포넌트와 페이지는 WCAG 2.1 AA 기준을 충족한다.
컴포넌트별 구체적인 `aria-*` 속성 명세는 `docs/architecture/COMPONENTS.md` 참고.

---

## 1. 색상 대비

| 용도 | 최소 대비율 | 확인 도구 |
|------|------------|-----------|
| 일반 텍스트 (14pt 미만) | 4.5:1 | Chrome DevTools / axe |
| 큰 텍스트 (14pt Bold 이상, 18pt 이상) | 3:1 | |
| UI 컴포넌트 경계, 아이콘 | 3:1 | |

`text-text-primary` (#191F28) on `bg-bg-default` (#FFFFFF) → 대비율 약 17:1 ✅  
`text-disabled` (#8B95A1) on `bg-bg-default` (#FFFFFF) → 대비율 약 3.5:1 ✅

---

## 2. 키보드 내비게이션

- 모든 인터랙티브 요소(버튼, 링크, 입력)는 Tab으로 접근 가능해야 한다.
- `outline: none` 금지 — 커스텀 `focus-visible` 스타일로 대체한다.
- 논리적 탭 순서: DOM 순서와 시각적 순서가 일치해야 한다.
- `tabIndex` 양수값 사용 금지 (자연스러운 DOM 순서 유지).

```css
/* src/app/styles/global.css */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary;
}
```

---

## 3. 스크린 리더

- 아이콘(lucide-react): 반드시 `aria-hidden="true"` — 텍스트 또는 `aria-label`로 의미 전달.
- 장식용 이미지: `alt=""`.
- 동적 콘텐츠 변경(로딩 완료, 에러 발생): `aria-live` 영역으로 알림.

```tsx
// 아이콘 전용 버튼 패턴
<button aria-label="삭제">
  <Trash2 aria-hidden="true" size={20} />
</button>

// 로딩 상태 알림
<div aria-live="polite" aria-atomic="true">
  {isLoading && <span className="sr-only">로딩 중</span>}
</div>
```

---

## 4. 폼 접근성

requirement.md에서 "form의 input에 대한 label이 표기되어야 합니다" 필수 명시.

- 모든 입력 필드에 `<label htmlFor={id}>` 명시적 연결 (`aria-label` 대체 불가).
- 에러 메시지: `role="alert"` + `aria-describedby="{id}-error"` 연결.
- 힌트 텍스트: `aria-describedby="{id}-hint"` 연결.
- 필수 입력 필드: `aria-required="true"`.
- 제출 비활성 상태: `disabled` + `aria-disabled="true"` 동시 적용.
- `<form noValidate>`: 브라우저 기본 유효성 팝업 비활성화, 커스텀 UI 사용.

```tsx
// Input 컴포넌트 패턴
<label htmlFor={id}>{label}</label>
<input
  id={id}
  aria-invalid={!!error}
  aria-describedby={[hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean).join(' ') || undefined}
  aria-required
/>
{hint && <p id={`${id}-hint`}>{hint}</p>}
{error && <p id={`${id}-error`} role="alert">{error}</p>}
```

---

## 5. 모달 포커스 관리

- 열릴 때: 모달 내 첫 번째 포커서블 요소로 포커스 이동.
- **포커스 트랩**: Tab / Shift+Tab이 모달 내에서만 순환.
- 닫힐 때: 모달을 열었던 트리거 요소로 포커스 반환.
- ESC 키 → 닫기.
- 딤 레이어: `aria-hidden="true"` (모달 외부 콘텐츠 스크린 리더 차단).

```tsx
// Modal 역할 구분
// 일반 다이얼로그
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// 경고성 다이얼로그 (ErrorModal, DeleteConfirmModal)
<div role="alertdialog" aria-modal="true" aria-labelledby="modal-title">
```

---

## 6. 라우팅 / 페이지 전환 접근성

- 라우트 전환 시 페이지 제목(`<title>`) 업데이트 — 스크린 리더가 페이지 변경을 인식.
- 라우트 전환 후 주요 콘텐츠 영역(`<main>`)으로 포커스 이동 고려.
- `<main>`, `<header>`, `<nav>` 등 HTML 랜드마크 요소 사용 필수.

```tsx
// app/router/routes/__root.tsx
// 라우트 전환마다 document.title 갱신
```

---

## 7. 목록 / 가상 스크롤 접근성

- 가상화 컨테이너: `role="list"`, 각 아이템: `role="listitem"`.
- 다음 페이지 로딩 중 하단 sentinel: `aria-label="다음 항목 불러오는 중"` LoadingSpinner 표시.

---

## 8. 애니메이션 / 모션

`prefers-reduced-motion` 대응 CSS는 `docs/design/DESIGN.md` §9 참고.

---

## 9. 검증 도구

| 도구 | 용도 |
|------|------|
| axe DevTools (Chrome 확장) | 자동 WCAG 위반 감지 |
| Chrome DevTools → Accessibility 패널 | 접근성 트리 확인 |
| Lighthouse Accessibility 감사 | 점수 기반 전체 검토 |
| 키보드 탭 순서 직접 테스트 | 마우스 없이 Tab만으로 전체 플로우 검증 |
