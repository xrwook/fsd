# 권한 플로우 문서

현재 권한/메뉴 구조는 API가 내려준 메뉴 트리와 URL을 기준으로 동작합니다.

`vite-plugin-pages` 파일 시스템 라우팅은 사용하지 않습니다. URL은 API에서 바뀔 수 있으므로, 프론트는 `menuId -> page component` 연결만 고정으로 관리합니다.

## 핵심 파일

- `src/app/App.tsx`
  - `AppRouter`를 렌더링합니다.
- `src/app/router/AppRouter.tsx`
  - `/403`과 catch-all route만 선언합니다.
  - 실제 메뉴 화면 처리는 `DynamicMenuRoute`가 담당합니다.
- `src/app/router/DynamicMenuRoute.tsx`
  - 현재 URL과 API 메뉴의 `url`을 비교합니다.
  - 매칭된 메뉴의 `read` 권한을 확인합니다.
  - `menuPageMap[menu.id]`에 등록된 화면 컴포넌트를 렌더링합니다.
- `src/app/router/menu-page-map.ts`
  - `menuId -> page component`를 관리합니다.
  - API URL이 바뀌어도 `menuId`가 같으면 같은 화면을 렌더링합니다.
- `src/entities/user/api/getMenuPermissionApi.ts`
  - 권한 메뉴 API를 React Query로 조회합니다.
  - 응답은 zod schema로 검증합니다.
- `src/entities/user/lib/permission/menuIds.ts`
  - 프로젝트에서 지원하는 메뉴 ID를 한 곳에서 관리합니다.
- `src/entities/user/lib/permission/schema.ts`
  - 권한 메뉴 응답 schema를 관리합니다.
- `src/entities/user/lib/permission/useMenuPermission.ts`
  - `useGetMenuPermissionQuery()`를 직접 호출해 React Query cache의 권한 데이터를 사용합니다.
  - `canAccessMenu`, `canAccessMenuGroup`을 제공합니다.
- `src/widgets/sidebar/ui/Sidebar.tsx`
  - 권한 메뉴 트리를 사이드 메뉴로 렌더링합니다.
  - 이동 경로는 API 메뉴의 `url`을 사용합니다.

## 데이터 형태

```ts
{
  id: MENU_ID.EMSP_MEMBER_INFO,
  parentId: MENU_ID.EMSP_MEMBER_MANAGEMENT,
  depth: 3,
  name: "회원정보",
  type: "menu",
  url: "/emsp/member-management/members",
  checked: false,
  permissions: {
    read: true,
    write: false,
    download: false,
  },
}
```

`url`은 API에서 내려주며 변경될 수 있습니다. 단, `id`는 프론트가 지원하는 `MENU_ID` 값이어야 합니다.

## 전체 흐름

```text
src/main.tsx
  -> enableMocking()
  -> QueryProvider
  -> BrowserRouter
  -> App

App
  -> AppRouter

AppRouter
  -> /403: ForbiddenPage
  -> *: DynamicMenuRoute

DynamicMenuRoute
  -> useMenuPermission()
    -> useGetMenuPermissionQuery()
    -> getMenuPermissionApi()
    -> zod parse
    -> React Query cache 저장
  -> 현재 location.pathname 확인
  -> permissionMenus를 flat하게 변환
  -> menu.url과 현재 URL 비교
  -> 매칭 메뉴 없음: NotFoundPage
  -> read 권한 없음: /403
  -> menuPageMap[menu.id] 없음: NotFoundPage
  -> page component 렌더링
```

## URL이 바뀌는 경우

API가 아래처럼 URL을 바꿔도 됩니다.

```ts
{
  id: MENU_ID.EMSP_MEMBER_INFO,
  url: "/emsp/member-management/members",
}
```

프론트는 URL로 메뉴를 찾은 뒤 `MENU_ID.EMSP_MEMBER_INFO`에 연결된 컴포넌트를 렌더링합니다.

```ts
export const menuPageMap = {
  [MENU_ID.EMSP_MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
};
```

즉, URL은 API에서 관리하고 화면 컴포넌트 연결은 프론트에서 `menuId` 기준으로 관리합니다.

## 사이드 메뉴

사이드 메뉴는 API 메뉴 트리를 그대로 사용합니다.

- 권한 없는 메뉴는 숨깁니다.
- 하위에 접근 가능한 메뉴가 있는 폴더는 표시합니다.
- 클릭 이동은 `menu.url`을 사용합니다.
- `url`이 없는 leaf 메뉴는 disabled 상태입니다.
- 즐겨찾기는 `url`이 있는 메뉴만 추가할 수 있습니다.

## 새 화면 추가 절차

1. `MENU_ID`에 새 메뉴 ID를 추가합니다.
2. API 권한 메뉴 응답에 같은 `id`와 원하는 `url`을 내려줍니다.
3. `src/pages` 아래에 페이지 컴포넌트를 만듭니다.
4. `src/app/router/menu-page-map.ts`에 `menuId -> page component`를 추가합니다.
5. 버튼/기능 단위 권한은 `useMenuPermission()` 또는 `PermissionGate`로 처리합니다.

## 주의사항

- API가 새로운 URL을 내려줘도 `menuId`에 연결된 page component가 없으면 화면을 렌더링할 수 없습니다.
- URL 자유 입력 화면이 있다면 `menuId`는 프론트가 지원하는 값만 선택하도록 제한해야 합니다.
- `checked`는 접근 판단 기준이 아닙니다. 실제 판단은 `permissions[permissionKey]`입니다.
