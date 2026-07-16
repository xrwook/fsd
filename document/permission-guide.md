# 권한 사용 가이드

이 문서는 화면 개발자가 메인 정보/메뉴 권한 기능을 사용할 때 필요한 최소 흐름만 정리합니다.

## 기본 흐름

사용자 정보, 파트너 정보, 약관, 메뉴 권한 데이터는 `useMainInfo()`에서 조회합니다.

```tsx
import { useMainInfo } from "@/entities/user";
import { SCREEN_ID } from "@/shared/config";

const Page = () => {
  const { canAccessMenu } = useMainInfo();

  return (
    <>{canAccessMenu(SCREEN_ID.DASHBOARD) && <button>접근 가능</button>}</>
  );
};
```

권한 데이터는 React Query로 조회하고 query cache에 유지합니다. 화면에서는 직접 API를 호출하지 않고 `useMainInfo()`를 사용합니다.

## Screen ID

`screenId`는 한 곳에서 관리합니다.

```ts
import { SCREEN_ID } from "@/shared/config";

SCREEN_ID.DASHBOARD;
SCREEN_ID.EMSP.MEMBER_INFO;
SCREEN_ID.EMSP.CORPORATE_JOIN_MANAGEMENT;
```

권한 체크 코드와 추가 라우트 설정에서는 문자열을 직접 쓰지 않고 `SCREEN_ID`를 사용합니다.

## 권한 필드

메뉴별 권한은 API가 내려주는 boolean 필드 그대로 사용합니다.

```ts
canRead | canCreate | canUpdate | canDelete | canDownload;
```

기본 접근 권한은 `canRead`입니다.

## 페이지 접근 권한

API가 내려준 `url`과 현재 브라우저 URL을 비교해서 접근할 메뉴를 찾습니다.

```text
현재 URL
  -> API 메뉴 트리에서 같은 url을 가진 메뉴 검색
  -> 해당 screenId의 canRead 권한 확인
  -> pageMap[screenId] 화면 렌더링
```

권한 초기화 전에는 아무것도 렌더링하지 않고, 권한이 없으면 `/403`으로 이동합니다. API URL에 매칭되는 메뉴가 없거나 `screenId`에 연결된 화면 컴포넌트가 없으면 404 화면을 렌더링합니다.

화면 컴포넌트 연결은 `src/app/router/menu-page-map.ts`에서 관리합니다.

```ts
export const pageMap = {
  [SCREEN_ID.EMSP.MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
};
```

## 추가 페이지 라우트

상세/등록/수정처럼 API 메뉴에는 없지만 특정 메뉴 하위에서 열리는 화면은 `src/app/router/extra-page-routes`에 추가합니다.

```ts
export const emspExtraPageRoutes = {
  [SCREEN_ID.EMSP.MEMBER_INFO]: [
    {
      relativePath: "/:memberId",
      parentMenuId: SCREEN_ID.EMSP.MEMBER_INFO,
      screenId: SCREEN_ID.EMSP.MEMBER_INFO_DETAIL,
      requirePermission: "canRead",
      pages: lazy(
        () => import("@/pages/eMSP/member-management/member-info-detail"),
      ),
    },
  ],
} satisfies TExtraPageRouteGroups;
```

추가 페이지의 URL은 부모 메뉴의 API `url`에 `relativePath`를 붙여 만듭니다. 진입 권한은 `parentMenuId` 메뉴의 `requirePermission` 필드로 확인합니다.

## 버튼/기능 권한

버튼, 다운로드, 수정 기능처럼 화면 일부만 제어할 때는 `useMainInfo()`와 `PermissionGate`를 사용합니다.

```tsx
import { useMainInfo } from "@/entities/user";
import { SCREEN_ID } from "@/shared/config";
import PermissionGate from "@/shared/ui/permission-gate";

const Page = () => {
  const { canAccessMenu } = useMainInfo();

  return (
    <PermissionGate
      allow={canAccessMenu(SCREEN_ID.CPOS.STATION_MANAGEMENT, "canUpdate")}
      fallback={<button disabled>수정 불가</button>}
    >
      <button>수정</button>
    </PermissionGate>
  );
};
```

단순 조건 분기도 가능합니다.

```tsx
const { canAccessMenu } = useMainInfo();

if (canAccessMenu(SCREEN_ID.DASHBOARD, "canDownload")) {
  // 다운로드 허용
}
```

## 사이드 메뉴

사이드 메뉴는 API/mock의 메뉴 권한 데이터 기준으로 표시됩니다.

- 단일 메뉴: `canAccessMenu(screenId, "canRead")`가 true이면 표시
- 폴더 메뉴: 자신 또는 하위 메뉴 중 하나라도 접근 가능하면 표시
- 이동 URL: API/mock이 내려준 `url` 사용
- 즐겨찾기: `url`이 있는 메뉴만 별 아이콘으로 추가 가능

## 새 메뉴/화면 추가 절차

1. `SCREEN_ID`에 screenId를 추가합니다.

```ts
export const SCREEN_ID = {
  EMSP: {
    MEMBER_INFO: "emsp-member-info",
  },
} as const;
```

2. API/mock 메뉴 데이터에 같은 `screenId`와 `url`을 추가합니다.

```ts
{
  menuId: 15,
  screenId: SCREEN_ID.EMSP.MEMBER_INFO,
  name: "회원정보",
  url: "/emsp/member-management/members",
  canRead: true,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canDownload: false,
  children: [],
}
```

3. 페이지 컴포넌트를 추가합니다.

```text
src/pages/eMSP/member-management/member-info/index.tsx
```

4. `menu-page-map.ts`에 `screenId -> page component`를 연결합니다.

```tsx
export const pageMap = {
  [SCREEN_ID.EMSP.MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
};
```

## 주의사항

- API 원본 메뉴 데이터에는 `type`, `depth`, `expanded`를 넣지 않습니다.
- `type`, `depth`, `expanded`는 `createMenuPermissions()`에서 화면 렌더링용으로만 계산합니다.
- 화면에서 권한 API를 직접 호출하지 않고 `useMainInfo()`를 사용합니다.
- 초기화 전 권한은 아직 모르는 상태이므로 `isMainInfoInitialized`를 고려해야 합니다.
- `screenId` 문자열은 직접 쓰지 않고 `SCREEN_ID`에 추가한 값을 사용합니다.
- API가 새로운 `url`을 내려줘도 같은 `screenId`에 page component가 연결되어 있으면 같은 화면을 렌더링합니다.
