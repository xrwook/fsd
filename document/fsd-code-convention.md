# ✨ FSD Coding Convention

이 문서는 FSD(Feature-Sliced Design) 프로젝트의 **아키텍처 전용** 코딩 컨벤션을 정의합니다.

> 일반 레벨 컨벤션(함수 선언, TypeScript, 파일명, 변수명, 스타일, 상태 관리 등)은  
> [코딩-컨벤션.md](./코딩-컨벤션.md)를 참조하세요.

---

## 📋 목차

1. [FSD 레이어 구조](#fsd-레이어-구조)
2. [레이어 책임 규칙](#레이어-책임-규칙)
3. [Import 규칙](#import-규칙)
4. [세그먼트 구조](#세그먼트-구조)
5. [Public API 규칙](#public-api-규칙)

---

## FSD 레이어 구조

FSD는 아래 6개 레이어로 구성되며, 상위 레이어는 하위 레이어만 `import`할 수 있습니다.

```text
src/
├── app/        # 앱 진입점, 라우팅, 전역 Provider
├── pages/      # 페이지 컴포넌트
├── widgets/    # 복합 UI 구성 (여러 entities/features 조합)
├── features/   # 비즈니스 로직 기능 단위
├── entities/   # 도메인 엔티티 (타입, API 호출)
└── shared/     # 재사용 유틸, UI 컴포넌트, 설정
```

### 레이어 간 import 방향

```text
app → pages → widgets → features → entities → shared
```

- 하위 레이어는 상위 레이어를 `import`할 수 없습니다.
- 같은 레이어 내 슬라이스 간 직접 `import`는 금지됩니다. (`@x` 패턴 사용)
- 이 규칙은 ESLint로 강제됩니다.

---

## 레이어 책임 규칙

각 레이어는 명확한 책임 경계를 가집니다. 파일 경로가 올바르더라도 **코드 내용**이 레이어 책임을 벗어나면 위반입니다.

| 레이어 | ❌ 위반 | 이유 |
|---|---|---|
| `shared/` | 도메인 타입 import, 비즈니스 로직 | `shared`는 도메인에 무관해야 모든 레이어에서 재사용 가능 |
| `entities/` | POST/PUT/DELETE API, mutation 상태, 유저 액션 핸들러 | `entities`는 읽기 전용 도메인 데이터 모델링 → 변경 의도(mutation)는 `features`에 위치 |
| `features/` | 도메인 타입 정의(`entities`), 도메인 무관 유틸(`shared`) | `features`는 도메인 + UI 로직 조합 → 도메인 자체를 정의하지 않음 |
| `widgets/` | 직접 API 호출, 자체 비즈니스 로직 | `widgets`는 `features/entities`를 조합한 UI 블록 → 로직이 있으면 중복 발생 |
| `pages/` | 비즈니스 로직 직접 구현 | `pages`는 라우팅과 위치 조합 역할 → 로직은 `features`에 위임해야 테스트 가능 |

---

## Import 규칙

### 1. 절대 경로 사용

레이어 간 `import`는 `@` alias를 사용한 절대 경로를 지정합니다.

**✅ 올바른 예시**

```typescript
import { TPost } from '@/entities/post';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/tailwind';
```

**❌ 잘못된 예시**

```typescript
import { TPost } from '../../entities/post';
```

---

### 2. 슬라이스 내부 import는 상대 경로 사용

`entities`, `features`, `widgets`, `pages` 레이어에서 같은 슬라이스 내부 파일을 `import`할 때는 상대 경로를 사용합니다.

> `shared`와 `app` 레이어는 슬라이스 구조가 없으므로 이 규칙이 적용되지 않습니다.

**✅ 올바른 예시**

```typescript
// 같은 슬라이스 내부
import { useDisclosure } from './hooks';
import { transformMarkdown } from '../lib';
```

**❌ 잘못된 예시**

```typescript
// 같은 슬라이스 내부에서 절대 경로 사용
import { useDisclosure } from '@/pages/tutorial-template-dashboard/ui/hooks';
```

---

### 3. Cross-slice import: `@x` 폴더 패턴 (FSD 2.1)

같은 레이어 내 다른 슬라이스의 코드가 필요한 경우, 직접 `import`는 금지됩니다. 대신 **공개할 슬라이스에 `@x` 폴더**를 만들어 허용할 인터페이스만 노출합니다.

```text
features/
├── like-post/
│   ├── ui/
│   ├── api/
│   └── @x/
│       └── index.ts  ← 다른 feature 슬라이스에 공개할 것만 re-export
└── post-card/
    └── ui/
        └── PostCard.tsx
```

**✅ 올바른 예시 — `@x`를 통한 cross-slice import**

```typescript
// features/post-card/ui/PostCard.tsx
import { LikeButton } from '@/features/like-post/@x';
```

**❌ 잘못된 예시 — 직접 cross-slice import**

```typescript
// features/post-card/ui/PostCard.tsx
import { LikeButton } from '@/features/like-post/ui/LikeButton';
```

> ESLint `fsd/no-cross-slice` 규칙이 이를 강제하며, 위반 시 `@x` 폴더 사용을 안내하는 에러가 발생합니다.

---

## 세그먼트 구조

슬라이스 내부는 역할별 폴더(세그먼트)로 구분합니다.

```text
features/auth/
├── api/
│   ├── login.ts
│   └── logout.ts
├── model/
│   └── session.ts
├── ui/
│   ├── LoginForm.tsx
│   └── LoginForm.stories.tsx
├── lib/
│   └── validateCredentials.ts
├── config/
│   └── permissions.ts
└── index.ts
```

| 세그먼트 | 용도 | 예시 |
|---|---|---|
| `api/` | API 요청 함수 | `features/auth/api/login.ts` |
| `model/` | 타입, 상태, 도메인 모델 | `entities/user/model/session.ts` |
| `ui/` | React 컴포넌트 (PascalCase) | `features/auth/ui/LoginForm.tsx` |
| `lib/` | 슬라이스 전용 유틸 함수 | `features/auth/lib/validateCredentials.ts` |
| `config/` | 슬라이스 전용 설정 | `features/auth/config/permissions.ts` |

세그먼트 폴더 이름이 이미 역할을 설명하므로, 내부 파일명은 `requests.ts`, `types.ts` 같은 범용 이름 대신 다루는 **도메인 개념이나 동작**을 드러내는 이름을 사용합니다.

스토리북 파일은 컴포넌트와 같은 `ui/` 폴더에 둡니다: `LoginForm.stories.tsx`

---

## Public API 규칙

### index.ts Barrel Export

각 슬라이스(레이어 내 폴더)는 반드시 `index.ts`를 통해 외부에 공개할 인터페이스를 명시합니다. 외부에서는 `index.ts`만 통해 접근합니다.

**✅ 올바른 예시**

```typescript
// entities/post/index.ts
export * from './model/types';
export * from './api/requests';
```

```typescript
// 외부에서 사용 시
import { TPost, useGetPostsQuery } from '@/entities/post';
```

**❌ 잘못된 예시**

```typescript
// 내부 경로 직접 접근
import { TPost } from '@/entities/post/model/types';
```

### pages 레이어 index.tsx 패턴

`pages`의 `index.tsx`는 UI 컴포넌트를 re-export하는 역할만 합니다.

```typescript
// pages/home/index.tsx
export { default } from './ui/Home';
```

### widgets 레이어 index.ts 패턴

`widgets`의 `index.ts`는 하위 UI 컴포넌트를 named export로 재노출합니다.

```typescript
// widgets/tutorial-dashboard/index.ts
export { default as DashboardHeader } from './ui/DashboardHeader';
export { default as TeamMembers } from './ui/TeamMembers';
export { default as PerformanceAnalytics } from './ui/PerformanceAnalytics';
```