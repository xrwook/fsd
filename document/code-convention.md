# ✨ 코딩 컨벤션

이 문서는 프로젝트의 코딩 컨벤션을 정의합니다.  
각 항목은 유지보수성, 성능, 타입 안전성 기준으로 우선순위가 높은 것들을 선별하였습니다.

## 📋 목차

### 🧑‍💻 프로젝트 자체 컨벤션

> 팀 내부적으로 권장하는 코딩 규칙입니다. 강제 사항은 아니지만, 일관된 코드베이스 유지를 위해 따르기를 권장합니다.

1. [컴포넌트 선언 규칙](#1-컴포넌트-선언-규칙)
2. [Import 규칙](#2-import-규칙)
3. [TypeScript 규칙](#3-typescript-규칙)
4. [파일명 규칙](#4-파일명-규칙)
5. [변수/함수명 규칙](#5-변수함수명-규칙)
6. [스타일 규칙](#6-스타일-규칙)

### 📚 Vercel 스킬 기반 컨벤션

> Vercel Engineering의 React 베스트 프랙티스와 Composition 패턴을 기반으로 합니다.  
> **참고한 스킬 파일** 링크에서 상세 내용을 확인하세요.

#### 참고한 스킬 파일

| 스킬 | 경로 |
| --- | --- |
| React Best Practices (Vercel) | [vercel-react-best-practices](../../.claude/skills/vercel-react-best-practices/SKILL.md) |
| React Composition Patterns (Vercel) | [vercel-composition-patterns](../../.claude/skills/vercel-composition-patterns/SKILL.md) |

## 🧑‍💻 프로젝트 자체 컨벤션

> 팀 내부적으로 권장하는 코딩 규칙입니다. 강제 사항은 아니지만, 일관된 코드베이스 유지를 위해 따르기를 권장합니다.

### 1. 컴포넌트 선언 규칙

컴포넌트 및 함수는 `const`와 화살표 함수(arrow function)를 사용합니다.

**✅ 올바른 예시**

```tsx
const UserProfile = () => {
  return <div>...</div>;
};

export default UserProfile;
```

**❌ 잘못된 예시**

```tsx
function UserProfile() {
  return <div>...</div>;
}

export default UserProfile;
```

`memo()`로 감싸는 경우에 한해, 디버깅 편의를 위해 함수 이름을 명시합니다.

```tsx
// memo() 내부에서는 예외적으로 함수 이름 명시 - DevTools/에러 스택에서 이름 표시됨
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user]);
  return <Avatar id={id} />;
});
```

---

### 2. Import 규칙

모든 import 문에서는 `@` alias를 사용하며 절대 경로를 지정합니다.

**✅ 올바른 예시**

```typescript
import MyComponent from '@/components/MyComponent';
```

**❌ 잘못된 예시**

```typescript
import MyComponent from '../../components/MyComponent';
```

---

### 3. TypeScript 규칙

#### Props 타입 정의

React 컴포넌트의 props 타입은 **interface**를 사용하며, 이름은 **Props**로 통일합니다.

```typescript
type UserStatus = 'active' | 'inactive' | 'suspended';

interface IUser {
  id: number;
  name: string;
  status: UserStatus;
}

interface Props {
  user: IUser;
  onStatusChange: (status: UserStatus) => void;
}
```

#### API 타입 명명 규칙

- Request/Response 타입은 **동일 파일**에 함께 작성합니다.
- postfix는 `Request` / `Response`를 사용합니다.

| 종류 | 형식 | 예시 |
| --- | --- | --- |
| 요청 파라미터 | `...Request` | `GetPostByIdRequest` |
| 응답 데이터 | `...Response` | `GetPostByIdResponse` |

---

### 4. 파일명 규칙

| 종류 | 형식 | 예시 |
| --- | --- | --- |
| UI 컴포넌트 | PascalCase | `UserProfile.tsx`, `Button.tsx` |
| 컴포넌트 스타일 | PascalCase | `UserProfile.module.css` |
| 공통 스타일 | camelCase | `globalStyle.css`, `resetStyle.css` |
| 기타 파일 | camelCase | `utils.ts`, `axiosInstance.ts` |

#### 슬라이스 내부 전용 UI 파일

슬라이스(slice)의 `index`에서 export하지 않는 내부 전용 UI 컴포넌트는 파일명 앞에 `_`를 붙입니다.

**✅ 올바른 예시**

```txt
src/pages/user/
├── index.ts              ← UserPage만 export
├── UserPage.tsx
└── _UserCard.tsx         ← 외부 노출 불필요, index에서 export 안 함
```

**❌ 잘못된 예시**

```txt
src/pages/user/
├── index.ts              ← UserPage, UserCard 둘 다 export
├── UserPage.tsx
└── UserCard.tsx          ← 슬라이스 내부에서만 쓰는데 외부에 노출됨
```

#### 폴더명 규칙

모든 폴더명은 **kebab-case**를 사용합니다.

| 종류 | 형식 | 예시 |
| --- | --- | --- |
| 모든 폴더 | kebab-case | `user-profile/`, `query-keys/`, `confirm-modal/` |

**✅ 올바른 예시**

```txt
src/features/user-profile/
src/shared/ui/confirm-modal/
src/shared/query-keys/
```

**❌ 잘못된 예시**

```txt
src/features/userProfile/
src/shared/ui/ConfirmModal/
src/shared/QueryKeys/
```

---

### 5. 변수/함수명 규칙

| 종류 | 형식 | 예시 |
| --- | --- | --- |
| Query Hook | `use...Query` | `useGetFilterPostQuery()` |
| Mutation Hook | `use...Mutation` | `useCreatePostMutation()` |
| API 호출 함수 | `...Api` | `getPostByIdApi()`, `createPostApi()` |

---

### 6. 스타일 규칙

#### Tailwind 클래스 병합

`tailwind-merge`의 `cn` 함수를 사용하여 클래스를 병합합니다.

```tsx
import { cn } from '@/utils/tailwind';

const Component = ({ className }: Props) => {
  return <div className={cn('bg-blue-500 text-white', className)}>{/* ... */}</div>;
};
```

#### CSS Module Import

CSS Module import 시 변수명은 **styles**로 통일합니다.

```tsx
import styles from './UserProfile.module.css';
```