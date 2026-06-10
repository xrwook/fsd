# 권한 플로우 문서

이 문서는 현재 프로젝트의 데모 권한 흐름을 설명합니다.

현재 권한은 실제 서버 API가 아니라 mock API에서 받아오는 메뉴 트리 데이터를 기준으로 판단합니다. 권한 판단 기준은 메뉴 ID와 `read`, `write`, `download` 권한 키입니다.

## 핵심 파일

- `src/root.tsx`
  - 앱 시작 시 `useInitializePermission()`을 호출합니다.
- `src/entities/user/api/getUserPermissionApi.ts`
  - mock API처럼 300ms 후 권한 데이터를 반환합니다.
- `src/entities/user/lib/permission/config.ts`
  - `permissionMenuMock` 데이터와 메뉴 권한 판단 helper를 관리합니다.
- `src/entities/user/model/userStore.ts`
  - 현재 유저, 메뉴 권한, 권한 초기화 완료 여부를 저장합니다.
- `src/entities/user/model/useInitializePermission.ts`
  - mock API에서 권한 데이터를 받아 store에 저장합니다.
- `src/entities/user/lib/permission/usePermission.ts`
  - 화면에서 사용할 권한 체크 함수를 제공합니다.
- `src/app/routes/index.tsx`
  - 라우트 접근 권한을 확인합니다.
- `src/pages/home/ui/Home.tsx`
  - 버튼 단위 권한을 확인합니다.
- `src/shared/ui/permission-gate/index.tsx`
  - 권한이 없을 때 fallback UI를 렌더링합니다.

## 권한 데이터 형태

권한 데이터는 메뉴 트리 형태입니다.

```ts
type PermissionKey = "read" | "write" | "download";

type MenuPermission = {
  id: string;
  parentId: string | null;
  depth: number;
  name: string;
  type: "folder" | "menu";
  expanded?: boolean;
  checked: boolean;
  permissions: Record<PermissionKey, boolean>;
  children?: MenuPermission[];
};
```

예시:

```ts
{
  id: "station-management",
  parentId: "station-root",
  depth: 3,
  name: "충전소 관리",
  type: "menu",
  checked: true,
  permissions: {
    read: true,
    write: true,
    download: true,
  },
}
```

## 전체 흐름

```text
root.tsx
  -> useInitializePermission()
    -> getUserPermissionApi()
      -> 300ms 지연
      -> permissionMenuMock 복사본 반환
    -> userStore 저장
      -> currentUser
      -> permissionMenus
      -> isPermissionInitialized = true

route/page
  -> usePermission()
    -> canAccessMenu(menuId, permissionKey)
    -> canAccessMenuGroup(menuId, permissionKey)
```

## 초기 상태

`userStore`는 처음에 권한을 모르는 상태로 시작합니다.

```ts
currentUser: null
permissionMenus: null
isPermissionInitialized: false
```

`isPermissionInitialized`가 `false`인 동안에는 라우트/버튼 권한 판단을 보류합니다. 이 값이 없으면 mock API 응답이 오기 전에 권한 없음으로 판단되어 화면이 잘못 차단될 수 있습니다.

## 권한 초기화 흐름

`src/root.tsx`에서 앱이 렌더링될 때 `useInitializePermission()`을 실행합니다.

`useInitializePermission`은 mock API를 호출합니다.

```ts
const response = await getUserPermissionApi();
```

응답을 받으면 store에 저장합니다.

```ts
setCurrentUser({
  id: response.userId,
  role: response.role,
});

setPermissionMenus(response.permissions);
setPermissionInitialized(true);
```

API 호출 실패 시에는 유저와 권한을 비우고, 초기화 완료 상태만 true로 둡니다.

```ts
setCurrentUser(null);
setPermissionMenus(null);
setPermissionInitialized(true);
```

이렇게 하면 실패 상태에서도 라우트가 무한 대기하지 않고 접근 거부 흐름으로 넘어갑니다.

## mock API 흐름

`getUserPermissionApi`는 실제 fetch를 호출하지 않습니다. 대신 mock API처럼 비동기로 응답합니다.

```ts
await delay(300);
return structuredClone(demoUserPermission);
```

`structuredClone`을 사용하는 이유는 store나 화면에서 권한 데이터를 수정해도 원본 mock 데이터가 오염되지 않게 하기 위해서입니다.

## 권한 판단 기준

단일 메뉴 권한은 API가 내려준 `permissions` 값을 기준으로 허용됩니다.

```ts
menu.permissions[permissionKey] === true
```

예시:

```ts
canAccessMenu("station-management", "write");
```

이 호출은 `station-management` 메뉴를 찾고, 해당 메뉴의 `permissions.write`가 true인지 확인합니다.

## 메뉴 그룹 권한

상위 폴더나 사이드바 메뉴처럼 하위 메뉴까지 포함해서 접근 가능 여부를 판단해야 할 때는 `canAccessMenuGroup`을 사용합니다.

```ts
canAccessMenuGroup("cpos", "read");
```

이 함수는 `cpos` 자신 또는 하위 메뉴 중 하나라도 `read: true`이면 허용합니다.

## 라우트 접근 권한

`src/app/routes/index.tsx`는 먼저 권한 초기화 여부를 확인합니다.

```ts
if (!isPermissionInitialized) {
  return null;
}
```

초기화가 끝나면 `dashboard` 메뉴의 read 권한으로 홈 라우트 접근을 판단합니다.

```ts
if (!canAccessMenu("dashboard")) {
  return <NotFoundPage />;
}
```

`canAccessMenu("dashboard")`는 기본 권한 키가 `read`이므로 아래와 같습니다.

```ts
canAccessMenu("dashboard", "read");
```

## 버튼 권한

`src/pages/home/ui/Home.tsx`에서는 버튼별로 메뉴 권한을 확인합니다.

충전소 수정 버튼:

```ts
canAccessMenu("station-management", "write");
```

내보내기 버튼:

```ts
canAccessMenu("dashboard", "download");
```

권한이 없으면 `PermissionGate`가 fallback UI를 렌더링합니다.

```tsx
<PermissionGate
  allow={canAccessMenu("station-management", "write")}
  fallback={<button disabled>충전소 수정 불가</button>}
>
  <button>충전소 수정</button>
</PermissionGate>
```

## 현재 데모 결과

현재 mock 데이터 기준:

- `dashboard`
  - `checked: true`
  - `read/write/download: true`
  - 홈 라우트 접근 가능
  - 내보내기 버튼 표시
- `station-management`
  - `checked: true`
  - `read/write/download: true`
  - 충전소 수정 버튼 표시
- `station-fee-management`
  - `checked: false`
  - `read/write/download: false`
  - 접근 거부

## 확장 방법

새 메뉴 권한을 추가할 때:

1. mock API 응답 데이터에 새 메뉴를 추가합니다.
2. 화면이나 라우트에서 `canAccessMenu("menu-id", "read")` 형태로 체크합니다.
3. 상위 폴더 노출 여부가 필요하면 `canAccessMenuGroup("folder-id", "read")`를 사용합니다.

새 권한 키를 추가할 때:

1. `TPermissionKey` 타입에 새 키를 추가합니다.
2. 모든 메뉴의 `permissions` 객체에 새 키를 추가합니다.
3. `canAccessMenu("menu-id", "new-key")` 형태로 사용합니다.

## 주의 사항

- 현재 권한 체크는 데모용 클라이언트 권한 체크입니다.
- 실제 서비스에서는 서버 API에서도 동일한 권한 검증이 필요합니다.
- `checked`는 권한 판단 기준이 아니라 메뉴 트리 UI 상태로 취급합니다.
- 권한 API 응답 전에는 `isPermissionInitialized`가 false이므로 접근 판단을 하지 않습니다.
