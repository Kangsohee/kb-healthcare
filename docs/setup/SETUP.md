# Development Setup Guide

---

## 1. 사전 요구사항

| 도구 | 최소 버전 | 확인 명령 |
|------|-----------|-----------|
| Node.js | 20.x LTS 이상 | `node -v` |
| npm | 10.x 이상 (Node.js 내장) | `npm -v` |

---

## 2. 프로젝트 설치

```bash
# 저장소 클론 후
npm install
```

---

## 3. 환경 변수

프로젝트 루트에 `.env.development` 파일 생성:

```env
VITE_USE_MOCK=true
```

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_USE_MOCK` | MSW 활성화 여부 | `true` (개발) |

<!-- [프로덕션 주석]
실제 배포 환경에서는 .env.production에:
  VITE_USE_MOCK=false
  VITE_API_BASE_URL=https://api.example.com
를 설정한다. VITE_API_BASE_URL이 없으면 상대 경로(/)를 사용하므로
API 게이트웨이 또는 리버스 프록시 설정 필요.
-->

---

## 4. MSW 서비스 워커 등록

MSW의 서비스 워커 파일을 `public/` 폴더에 생성해야 합니다.
**최초 1회** 실행:

```bash
npx msw init public/ --save
```

이 명령은 `public/mockServiceWorker.js`를 생성합니다.
이 파일은 git에 커밋합니다 (MSW 권장 사항).

---

## 5. 개발 서버 실행

```bash
npm run dev
```

기본 포트: `http://localhost:5173`

MSW가 활성화되면 브라우저 콘솔에 다음 메시지가 표시됩니다:
```
[MSW] Mocking enabled.
```

---

## 6. 빌드

```bash
npm run build    # TypeScript 컴파일 + Vite 번들
npm run preview  # 빌드 결과물 로컬 미리보기
```

---

## 7. 테스트

```bash
npm test              # Vitest watch 모드
npm run test:run      # 단회 실행 (CI)
npm run test:coverage # 커버리지 리포트
```

---

## 8. 코드 품질

```bash
npm run lint        # ESLint 검사
npm run lint:fix    # ESLint 자동 수정
npm run typecheck   # tsc --noEmit
```

---

## 9. 주요 npm scripts 요약

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 10. 폰트 설정

Pretendard는 CDN 또는 로컬 파일로 제공.
**권장 방식**: `@fontsource/pretendard` 패키지 사용 <!-- 자의적 결정 -->

```bash
npm install @fontsource/pretendard
```

`src/main.tsx` 또는 `src/app/styles/global.css`에서 임포트:
```ts
import '@fontsource/pretendard/korean.css';
```

---

## 11. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| MSW 핸들러가 동작하지 않음 | `public/mockServiceWorker.js` 없음 | 4번 단계 재실행 |
| 로그인 후 화면이 안 넘어감 | `VITE_USE_MOCK=true` 미설정 | `.env.development` 확인 |
| 폰트가 적용 안 됨 | `@fontsource/pretendard` 미설치 | `npm install @fontsource/pretendard` |
