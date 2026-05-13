# Design System

requirement.md 기준: 색상 토큰 관리, Pretendard 폰트, 아이콘 항목별 중복 없이 지정.
구현은 TailwindCSS `tailwind.config.ts`의 `theme.extend`로 모든 토큰을 관리한다.

---

## 1. 색상 토큰

```ts
// tailwind.config.ts → theme.extend.colors
colors: {
  primary: {
    DEFAULT: '#0046B4',   // 주요 CTA, 활성 상태
    hover:   '#003A96',   // 호버 시
  },
  disabled: {
    DEFAULT: '#B0B8C1',   // 비활성 텍스트/아이콘
    bg:      '#F2F4F6',   // 비활성 버튼 배경
  },
  error:   '#E53E3E',     // 유효성 실패, 위험 액션
  success: '#38A169',     // 완료 상태 (DONE)
  text: {
    primary:   '#191F28', // 본문 기본 텍스트
    secondary: '#4E5968', // 보조 텍스트, 플레이스홀더
    disabled:  '#8B95A1', // 비활성 텍스트
  },
  bg: {
    default: '#FFFFFF',   // 기본 페이지 배경
    subtle:  '#F9FAFB',   // 카드, 섹션 배경
  },
  border:  '#E5E8EB',     // 기본 테두리
  overlay: 'rgba(0,0,0,0.48)', // 모달 딤 레이어
}
```

사용 예:
```tsx
<button className="bg-primary hover:bg-primary-hover text-white disabled:bg-disabled-bg disabled:text-disabled">
```

---

## 2. 타이포그래피

폰트: **Pretendard** (requirement.md 필수 명시)

```ts
// tailwind.config.ts → theme.extend.fontFamily
fontFamily: {
  sans: ['Pretendard', 'sans-serif'],
}
```

### 스케일

| 용도 | 클래스 | size | weight | line-height |
|------|--------|------|--------|-------------|
| 페이지 제목 | `text-2xl font-bold` | 24px | 700 | 1.4 |
| 섹션 제목 | `text-xl font-semibold` | 20px | 600 | 1.4 |
| 카드 제목 | `text-base font-semibold` | 16px | 600 | 1.5 |
| 본문 | `text-sm font-normal` | 14px | 400 | 1.6 |
| 보조 텍스트 | `text-xs font-normal` | 12px | 400 | 1.6 |
| 레이블 | `text-sm font-medium` | 14px | 500 | 1.4 |
| 에러 메시지 | `text-xs font-normal text-error` | 12px | 400 | 1.4 |

<!-- 자의적 결정 -->

---

## 3. 스페이싱 시스템

8px 베이스 그리드. Tailwind 기본 스케일 활용 (`p-2` = 8px, `p-4` = 16px 등).

| 용도 | 값 | Tailwind 클래스 |
|------|-----|----------------|
| 컴포넌트 내부 패딩 (소) | 8px | `p-2` |
| 컴포넌트 내부 패딩 (중) | 16px | `p-4` |
| 섹션 간 여백 | 24px | `gap-6` / `mb-6` |
| 페이지 컨텐츠 패딩 | 24px | `px-6` |
| 카드 간 여백 | 12px | `gap-3` |

<!-- 자의적 결정 -->

---

## 4. 레이아웃 규격

```
┌─────────────────────────────────────────────┐  ← GNB: 높이 56px, position: sticky top-0
├──────────┬──────────────────────────────────┤
│  LNB     │  콘텐츠 영역                      │
│  240px   │  flex-1, overflow-y: auto         │
│  고정폭   │  max-width: 없음                  │
└──────────┴──────────────────────────────────┘
```

| 요소 | 규격 |
|------|------|
| GNB 높이 | 56px |
| LNB 너비 | 240px (고정) |
| 콘텐츠 좌우 패딩 | 24px |
| 카드 최대 너비 | 제한 없음 (부모 컨테이너 100%) |

<!-- 자의적 결정 -->

---

## 5. 반응형 브레이크포인트

| 구간 | 기준 | 레이아웃 변화 |
|------|------|---------------|
| mobile | `< 768px` | LNB 숨김, 하단 네비게이션 또는 햄버거 메뉴 <!-- 자의적 결정 --> |
| tablet | `768px ~` | LNB 표시 (icon only, 48px) <!-- 자의적 결정 --> |
| desktop | `1024px ~` | LNB 전체 표시 (240px) |

```ts
// tailwind.config.ts 기본 브레이크포인트 사용
// md: 768px, lg: 1024px
```

<!-- 자의적 결정 -->

---

## 6. 아이콘 가이드

라이브러리: **lucide-react** (requirement.md "아이콘은 항목별로 겹치지 않게 지정" 명시)

| 위치 | 아이콘 | 컴포넌트 |
|------|--------|----------|
| LNB — 대시보드 | `LayoutDashboard` | `LNB.tsx` |
| LNB — 할 일 | `CheckSquare` | `LNB.tsx` |
| GNB — 로그인 상태 (회원정보) | `UserCircle` | `GNB.tsx` |
| GNB — 미로그인 (로그인) | `LogIn` | `GNB.tsx` |
| 삭제 버튼 | `Trash2` | `TaskDetailView` |
| 목록으로 (상세 헤더) | `ArrowLeft` | `TaskDetailView` |
| 비밀번호 표시 | `Eye` | `Input` (password) |
| 비밀번호 숨기기 | `EyeOff` | `Input` (password) |
| 모달 닫기 | `X` | `Modal` |
| 목록으로 돌아가기 | `ArrowLeft` | `EmptyState` (404) |

아이콘 크기: `size={16}` (인라인), `size={20}` (독립 아이콘 버튼) <!-- 자의적 결정 -->
모든 아이콘에 `aria-hidden="true"` 적용, 의미 전달은 텍스트 또는 `aria-label`로 처리.

---

## 7. 테두리 반경 (Border Radius)

| 요소 | 값 | Tailwind 클래스 |
|------|-----|----------------|
| 버튼 | 8px | `rounded-lg` |
| 카드 | 8px | `rounded-lg` |
| 입력 필드 | 8px | `rounded-lg` |
| 모달 패널 | 12px | `rounded-xl` |
| 배지/태그 | 9999px | `rounded-full` |

<!-- 자의적 결정 -->

---

## 8. 그림자 (Shadow)

| 용도 | Tailwind 클래스 |
|------|----------------|
| 카드 기본 | `shadow-sm` |
| 모달 패널 | `shadow-xl` |
| GNB | `shadow-sm` |

<!-- 자의적 결정 -->

---

## 9. 트랜지션 / 애니메이션

| 대상 | duration | easing | Tailwind 클래스 |
|------|----------|--------|----------------|
| 버튼 호버/활성 | 150ms | ease-in-out | `transition-colors duration-150` |
| 모달 오버레이 페이드 | 200ms | ease-out | `transition-opacity duration-200` |
| 모달 패널 슬라이드 | 200ms | ease-out | `transition-transform duration-200` |
| LNB 메뉴 활성 표시 | 150ms | ease-in-out | `transition-colors duration-150` |
| 포커스 아웃라인 | 100ms | ease-in-out | `transition-shadow duration-100` |

`prefers-reduced-motion` 미디어 쿼리 대응:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

<!-- 자의적 결정 -->

---

## 10. 상태별 스타일 요약

| 상태 | 적용 색상 | 비고 |
|------|-----------|------|
| 기본(default) | `text-text-primary`, `bg-bg-default` | |
| 호버(hover) | `bg-bg-subtle`, `text-primary` | 카드, 메뉴 |
| 활성(active/current) | `text-primary`, 좌측 `border-l-2 border-primary` | LNB 활성 메뉴 |
| 비활성(disabled) | `text-disabled`, `bg-disabled-bg` | 버튼, 입력 |
| 에러(error) | `border-error`, `text-error` | 입력 필드 |
| 로딩(loading) | 버튼 내 스피너, `opacity-70` | |
| TODO 상태 | `text-text-primary` | TaskCard status |
| DONE 상태 | `text-success` | TaskCard status |
