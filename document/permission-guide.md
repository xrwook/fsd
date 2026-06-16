# 권한 사용 가이드

이 문서는 화면 개발자가 권한 기능을 사용할 때 필요한 최소 흐름만 정리합니다.

## 기본 흐름

앱 진입 시 `src/app/App.tsx`에서 `useInitializeMenuPermission()`을 호출합니다.

```tsx
const App = () => {
  useInitializeMenuPermission();

  return <>{/* routes */}</>;
};
```

권한 데이터는 React Query로 조회하고, zod 검증 후 `menuPermissionStore`에 저장됩니다. 화면에서는 직접 API를 호출하지 않고 `useMenuPermission()`만 사용합니다.

## 권한 키

현재 메뉴별 권한 키는 3개입니다.

```ts
read | write | download;
```

기본 접근 권한은 `read`입니다.

## 메뉴 ID

메뉴 ID는 한 곳에서 관리합니다.

```ts
import { MENU_ID } from "@/entities/user";

MENU_ID.DASHBOARD;
MENU_ID.EMSP_MEMBER_INFO;
MENU_ID.EMSP_CORPORATE_JOIN_MANAGEMENT;
```

권한 체크 코드에서는 문자열을 직접 쓰지 않고 `MENU_ID`를 사용합니다.

## 페이지 접근 권한

API가 내려준 `url`과 현재 브라우저 URL을 비교해서 접근할 메뉴를 찾습니다.

```text
현재 URL
  -> API 메뉴 트리에서 같은 url을 가진 메뉴 검색
  -> 해당 menuId의 read 권한 확인
  -> menuPageMap[menuId] 화면 렌더링
```

권한 초기화 전에는 아무것도 렌더링하지 않고, 권한이 없으면 `/403`으로 이동합니다. API URL에 매칭되는 메뉴가 없거나 `menuId`에 연결된 화면 컴포넌트가 없으면 404 화면을 렌더링합니다.

화면 컴포넌트 연결은 `src/app/router/menu-page-map.ts`에서 관리합니다.

```ts
export const menuPageMap = {
  [MENU_ID.EMSP_MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
};
```

## 버튼/기능 권한

버튼, 다운로드, 수정 기능처럼 화면 일부만 제어할 때는 `useMenuPermission()`과 `PermissionGate`를 사용합니다.

```tsx
import { MENU_ID, useMenuPermission } from "@/entities/user";
import PermissionGate from "@/shared/ui/permission-gate";

const Page = () => {
  const { canAccessMenu } = useMenuPermission();

  return (
    <PermissionGate
      allow={canAccessMenu(MENU_ID.STATION_MANAGEMENT, "write")}
      fallback={<button disabled>수정 불가</button>}
    >
      <button>수정</button>
    </PermissionGate>
  );
};
```

단순 조건 분기도 가능합니다.

```tsx
const { canAccessMenu } = useMenuPermission();

if (canAccessMenu(MENU_ID.DASHBOARD, "download")) {
  // 다운로드 허용
}
```

## 사이드 메뉴

사이드 메뉴는 API/mock의 메뉴 권한 데이터 기준으로 표시됩니다.

- 단일 메뉴: `canAccessMenu(menuId, "read")`가 true이면 표시
- 폴더 메뉴: 하위 메뉴 중 하나라도 접근 가능하면 표시
- 이동 URL: API/mock이 내려준 `url` 사용
- 즐겨찾기: `url`이 있는 메뉴만 별 아이콘으로 추가 가능

## 새 메뉴/화면 추가 절차

1. `MENU_ID`에 메뉴 ID를 추가합니다.

```ts
export const MENU_ID = {
  EMSP_MEMBER_INFO: "emsp-member-info",
} as const;
```

2. 권한 데이터에 메뉴 ID를 추가합니다.

```ts
{
  id: MENU_ID.EMSP_MEMBER_INFO,
  name: "회원정보",
  type: "menu",
  url: "/emsp/member-management/members",
  permissions: {
    read: true,
    write: false,
    download: false,
  },
}
```

3. 페이지 컴포넌트를 추가합니다.

```text
src/pages/eMSP/member-management/member-info/index.tsx
```

4. `menu-page-map.ts`에 `menuId -> page component`를 연결합니다.

```tsx
export const menuPageMap = {
  [MENU_ID.EMSP_MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
};
```

API의 `url`은 이후 바뀌어도 됩니다. `menuId`가 같으면 같은 화면 컴포넌트를 렌더링합니다.

## 주의사항

- `checked`는 현재 접근 판단 기준이 아닙니다. 실제 판단은 `permissions[permissionKey]`로 합니다.
- 화면에서 권한 API를 직접 호출하지 않습니다.
- 초기화 전 권한은 아직 모르는 상태이므로 `isPermissionInitialized`를 고려해야 합니다.
- 메뉴 ID는 `MENU_ID`에서 추가한 값을 권한 데이터와 `menu-page-map.ts`가 같이 사용해야 합니다.
- API가 새로운 `url`을 내려줘도 해당 `menuId`에 연결된 page component가 없으면 화면을 렌더링할 수 없습니다.
