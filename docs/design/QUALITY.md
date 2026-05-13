# Quality Guidelines

비기능 요구사항 — 렌더링 성능, 웹뷰 대응, 클라이언트 로깅.

---

## 1. 렌더링 성능 최적화 (Reflow/Repaint)

### 적용 원칙

| 원칙 | 구현 |
|------|------|
| Layout Thrashing 방지 | DOM 읽기(`getBoundingClientRect`)와 쓰기를 같은 프레임 내 혼용 금지 |
| CSS Transform 우선 | 위치 이동은 `top/left` 대신 `transform: translate()` 사용 (Compositor 레이어) |
| `will-change` 제한 사용 | 애니메이션이 확실한 요소에만 `will-change: transform` 적용, 남용 금지 |
| 가상 스크롤 | `@tanstack/react-virtual`로 DOM 노드 수를 뷰포트 내 아이템으로 제한 |
| 이미지 | `loading="lazy"` + 명시적 `width`/`height` 설정으로 CLS 방지 |
| 무거운 연산 | `useMemo` / `useCallback`으로 불필요한 재계산 방지 (단, 측정 후 적용) |

### TaskVirtualList 최적화

```ts
// src/widgets/task-virtual-list/ui/TaskVirtualList.tsx
const rowVirtualizer = useVirtualizer({
  count: allItems.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 104, // TaskCard 96px + 카드 간 갭 8px (paddingBottom)
  overscan: 3,            // 뷰포트 밖 3개 미리 렌더링
});
```

### React 렌더링 최적화

- `React.memo`: 부모 리렌더링에 영향받지 않아야 하는 TaskCard에 적용.
- `useCallback`: 가상 목록에 전달하는 이벤트 핸들러에 적용.
- 불필요한 `useMemo` 남발 금지 — 먼저 프로파일링 후 적용.

---

## 2. 웹뷰 / 인앱 브라우저 대응

모바일 앱 Webview 환경에서 발생할 수 있는 이슈를 사전에 고려한다.

| 이슈 유형 | 대응 방법 |
|-----------|-----------|
| iOS Safari 100vh 버그 | `height: 100dvh` 사용, 폴백: `calc(var(--vh, 1vh) * 100)` |
| 스크롤 관성 | `-webkit-overflow-scrolling: touch` 대신 `overscroll-behavior: contain` |
| 포커스 시 뷰포트 축소 | `<meta name="viewport" content="..., interactive-widget=resizes-content">` 고려 |
| 뒤로가기 캐시(bfcache) | `unload` 이벤트 리스너 사용 금지, `pageshow` 이벤트로 토큰 재검증 |
| UserAgent 파싱 | `navigator.userAgent` 직접 파싱 대신 기능 감지(feature detection) 우선 |
| 텍스트 크기 자동 조정 | `text-size-adjust: 100%` 설정으로 기기 자동 확대 방지 |

```html
<!-- public/index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

<!-- [프로덕션 주석]
실제 앱 Webview 환경에서는 앱-웹 브릿지(JavascriptInterface / WKWebView) 통신이
필요할 수 있음. 이 과제에서는 브릿지 구현 범위 외.
-->

---

## 3. 클라이언트 로깅

과제 환경에서는 외부 로깅 서비스 연동 없이 구조만 구현한다.

```ts
// src/shared/lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

interface LogEvent {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export const logger = {
  info:  (message: string, context?: Record<string, unknown>) => log('info',  message, context),
  warn:  (message: string, context?: Record<string, unknown>) => log('warn',  message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
};

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const event: LogEvent = { level, message, context, timestamp: new Date().toISOString() };
  if (import.meta.env.DEV) {
    console[level](`[${event.timestamp}] ${message}`, context ?? '');
  }
  // [프로덕션 주석] 실제 환경에서는 Sentry.captureMessage() 또는
  // 자체 로깅 엔드포인트 POST 호출 추가
}
```

### 로깅 수집 지점

| 이벤트 | 레벨 | 위치 |
|--------|------|------|
| API 401 → refresh 실패 | `error` | `src/shared/api/apiClient.ts` |
| 삭제 성공 / 실패 | `info` / `error` | `src/features/task-delete/model/useDeleteTask.ts` |
| 라우트 진입 | `info` | `src/app/router/routes/__root.tsx` `beforeLoad` |
| 예상치 못한 에러 | `error` | React Error Boundary |
