# API Integration Guide

OAS 3.1 기준: `openapi.yaml` 원본이 우선합니다.
이 문서는 개발자 참조용 요약 및 구현 가이드입니다.

---

## Base URL

| 환경 | Base URL |
|------|----------|
| MSW (로컬 개발) | `/` (서비스 워커가 인터셉트) |
| 실제 서버 <!-- [프로덕션 주석] --> | 환경변수 `VITE_API_BASE_URL`로 주입 |

---

## 인증 헤더

Bearer 토큰 방식:

```
Authorization: Bearer <accessToken>
```

`/api/sign-in`을 제외한 모든 엔드포인트에 필요.
`src/shared/api/apiClient.ts`의 axios 인터셉터에서 자동 주입.

---

## 엔드포인트 목록

### POST /api/sign-in

로그인. 인증 토큰 발급.

**Request**
```json
{
  "email": "user@example.com",
  "password": "abc12345"
}
```

| 필드 | 타입 | 규칙 |
|------|------|------|
| email | string | RFC 5322 email 형식 |
| password | string | 영문+숫자, 8~24자 (`^[A-Za-z0-9]{8,24}$`) |

**Response 200**
```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>"
}
```

| 필드 | 저장 위치 |
|------|-----------|
| `accessToken` | Zustand `authStore` (메모리) |
| `refreshToken` | `document.cookie` (`token=...; path=/; SameSite=Strict`) <!-- [프로덕션 주석] 실제 환경에서는 서버가 HttpOnly 쿠키로 내려줌 --> |

**Response 400**
```json
{ "errorMessage": "이메일 또는 비밀번호가 올바르지 않습니다." }
```
→ `ErrorModal`로 `errorMessage` 표시.

---

### POST /api/refresh

액세스 토큰 갱신.

**Security**: `refreshTokenCookie` (쿠키 `token`)

<!-- [프로덕션 주석]
실제 환경에서는 HttpOnly 쿠키 자동 전송 (credentials: 'include').
현재 구현에서는 JS document.cookie(token)을 브라우저가 자동 전송. __root.tsx의 silent refresh는 bare axios로 호출해 쿠키가 요청에 포함됨.
-->

**Response 200**
```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>"
}
```

**Response 401 / 400**
```json
{ "errorMessage": "..." }
```
→ 토큰 전체 초기화 후 `/sign-in` 리다이렉트.

---

### GET /api/dashboard

대시보드 통계 조회.

**Security**: Bearer

**Response 200**
```json
{
  "numOfTask": 10,
  "numOfRestTask": 6,
  "numOfDoneTask": 4
}
```

**Response 401** → 토큰 갱신 시도. 실패 시 `/sign-in` 리다이렉트.

---

### GET /api/task?page={n}

할 일 목록 페이지 조회.

**Security**: Bearer

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `page` | integer (≥ 1) | O | 페이지 번호, 1-indexed |

**Response 200**
```json
{
  "data": [
    {
      "id": "abc123",
      "title": "운동하기",
      "memo": "30분 이상",
      "status": "TODO"
    }
  ],
  "hasNext": true
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `data` | TaskItem[] | 현재 페이지 아이템 |
| `hasNext` | boolean | 다음 페이지 존재 여부. `false`면 무한 스크롤 중단 |
| `data[].status` | `"TODO" \| "DONE"` | 할 일 상태 |

---

### GET /api/task/:id

할 일 상세 조회.

**Security**: Bearer

**Path Parameters**: `id` (string)

**Response 200**
```json
{
  "title": "운동하기",
  "memo": "30분 이상 유산소",
  "registerDatetime": "2026-05-10T09:00:00Z"
}
```

표시 포맷: `registerDatetime` → `format(new Date(value), 'yyyy.MM.dd HH:mm')` <!-- 자의적 결정 -->

**Response 404**
```json
{ "errorMessage": "존재하지 않는 할 일입니다." }
```
→ `EmptyState` 컴포넌트 + 목록으로 돌아가기 버튼 렌더링.

---

### DELETE /api/task/:id

할 일 삭제.

**Security**: Bearer

**Path Parameters**: `id` (string)

**Response 200**
```json
{ "success": true }
```
→ `queryKeys.tasks.all` 쿼리 invalidate, `/task`로 리다이렉트.

**Response 404** → sonner 토스트 표시.

---

### GET /api/user

회원 프로필 조회.

**Security**: Bearer

**Response 200**
```json
{
  "name": "홍길동",
  "memo": "안녕하세요"
}
```

---

## 에러 처리 공통 규칙

| HTTP 상태 | 처리 |
|-----------|------|
| 400 | API별 `errorMessage` 모달 또는 인라인 표시 |
| 401 | 자동 토큰 갱신 → 실패 시 `/sign-in` |
| 404 | `EmptyState` + 복귀 버튼 |
| 5xx | sonner 토스트 "서버 오류가 발생했습니다." <!-- 자의적 결정 --> |

---

## axios 클라이언트 구조 (`src/shared/api/apiClient.ts`)

```ts
// 개념 구조 — 실제 구현 파일 참고
const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/' });

// Request 인터셉터: accessToken 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response 인터셉터: 401 → refresh → 재시도
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // silent refresh 시도
    }
    return Promise.reject(error);
  }
);
```

---

## MSW 핸들러 파일 위치

```
src/mocks/handlers/
├── index.ts       # 개별 핸들러 합산 export
├── auth.ts        # POST /api/sign-in, POST /api/refresh
├── dashboard.ts   # GET /api/dashboard
├── task.ts        # GET /api/task, GET /api/task/:id, DELETE /api/task/:id
└── user.ts        # GET /api/user
```
