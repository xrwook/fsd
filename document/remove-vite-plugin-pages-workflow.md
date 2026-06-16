# vite-plugin-pages 제거 워크플로우

API에서 메뉴 URL을 내려주고 URL이 동적으로 바뀔 수 있는 프로젝트에서 `vite-plugin-pages`를 제거하는 작업 순서입니다.

## 목표 구조

파일 시스템 라우팅을 제거하고 아래 구조로 전환합니다.

```text
현재 브라우저 URL
  -> API 메뉴 트리에서 같은 url 검색
  -> 매칭된 menuId의 권한 확인
  -> menuPageMap[menuId] 화면 컴포넌트 렌더링
```

URL은 API가 관리하고, 프론트는 `menuId -> page component` 연결만 관리합니다.

## 1. 사전 확인

1. 현재 `vite-plugin-pages` 사용 지점을 확인합니다.

```bash
rg "vite-plugin-pages|~react-pages|virtual:generated-pages|useRoutes\\("
```

2. 기존 파일 시스템 라우트 목록을 확인합니다.

```bash
find src/app/routes -type f | sort
```

3. 각 라우트가 어떤 `menuId`와 어떤 page component를 렌더링하는지 정리합니다.

```text
menuId                                  page component
dashboard                               @/pages/home
emsp-member-info                        @/pages/eMSP/member-management/member-info
emsp-corporate-join-management          @/pages/eMSP/corporate-member/corporate-join
```

## 2. 권한 메뉴 응답에 url 추가

API 응답 schema에 `url`을 추가합니다.

```ts
const menuPermissionBaseSchema = z.object({
  id: menuIdSchema,
  parentId: menuIdSchema.nullable(),
  name: z.string(),
  type: z.enum(["folder", "menu"]),
  url: z.string().nullable().optional(),
  permissions: z.object({
    read: z.boolean(),
    write: z.boolean(),
    download: z.boolean(),
  }),
});
```

mock 데이터도 같은 형태로 맞춥니다.

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

## 3. URL 정제 기준 확인

백엔드가 프론트에서 바로 사용할 수 있는 내부 SPA path를 내려주는지 확인합니다.

권장 형식:

```text
/emsp/member-management/members
```

피해야 할 형식:

```text
emsp/member-management/members
https://admin.example.com/emsp/member-management/members
/emsp/member-management/members?tab=base
/emsp/member-management/members/
```

백엔드가 이 기준을 보장하지 못하면 프론트에서 URL 정규화 유틸을 별도로 둬야 합니다.

## 4. menuId -> page component map 추가

프론트가 렌더링 가능한 화면을 `menuId` 기준으로 등록합니다.

```ts
import { lazy } from "react";
import { MENU_ID } from "@/entities/user";
import type { TMenuId } from "@/entities/user";
import type { ComponentType, LazyExoticComponent } from "react";

type TMenuPageComponent = LazyExoticComponent<ComponentType>;

export const menuPageMap: Partial<Record<TMenuId, TMenuPageComponent>> = {
  [MENU_ID.DASHBOARD]: lazy(() => import("@/pages/home")),
  [MENU_ID.EMSP_MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
};
```

권장 위치:

```text
src/app/router/menu-page-map.ts
```

## 5. 동적 메뉴 라우터 추가

catch-all route에서 현재 URL과 API 메뉴의 `url`을 매칭합니다.

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useMenuPermission } from "@/entities/user";
import { flattenTree } from "@/shared/lib/utils";
import NotFoundPage from "@/pages/not-found";
import { menuPageMap } from "@/app/router/menu-page-map";

export const DynamicMenuRoute = () => {
  const location = useLocation();
  const { permissionMenus, isPermissionInitialized, canAccessMenu } =
    useMenuPermission();

  if (!isPermissionInitialized) {
    return null;
  }

  const currentMenu =
    flattenTree(permissionMenus, (menu) => menu.children).find((menu) => {
      return menu.url === location.pathname;
    }) ?? null;

  if (!currentMenu) {
    return <NotFoundPage />;
  }

  if (!canAccessMenu(currentMenu.id)) {
    return <Navigate to="/403" replace />;
  }

  const MenuPage = menuPageMap[currentMenu.id];

  if (!MenuPage) {
    return <NotFoundPage />;
  }

  return <MenuPage />;
};
```

권장 위치:

```text
src/app/router/DynamicMenuRoute.tsx
```

## 6. AppRouter 추가

React Router는 고정 라우트와 catch-all만 갖습니다.

```tsx
import { Route, Routes } from "react-router-dom";
import ForbiddenPage from "@/pages/forbidden";
import { DynamicMenuRoute } from "@/app/router/DynamicMenuRoute";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<DynamicMenuRoute />} />
    </Routes>
  );
};
```

권장 위치:

```text
src/app/router/AppRouter.tsx
```

## 7. App에서 useRoutes 제거

기존:

```tsx
import { useRoutes } from "react-router-dom";
import routes from "~react-pages";

<Suspense fallback={null}>{useRoutes(routes)}</Suspense>;
```

변경:

```tsx
import { AppRouter } from "@/app/router";

<Suspense fallback={null}>
  <AppRouter />
</Suspense>;
```

## 8. 사이드바 URL 연결 변경

기존 `menu-route-map.ts` 또는 `menuId -> path` 매핑을 제거하고 API의 `menu.url`을 사용합니다.

```tsx
const route = menu.url ?? null;

if (route) {
  navigate(route);
}
```

선택 상태도 같은 문자열 기준으로 비교합니다.

```tsx
const isSelected = location.pathname === route;
```

## 9. 기존 파일 시스템 라우트 제거

아래 파일들이 더 이상 필요 없으면 삭제합니다.

```text
src/app/routes/index.tsx
src/app/routes/403.tsx
src/app/routes/[...notFound].tsx
src/app/routes/_guards/PermissionRoute.tsx
src/app/routes/**/*
```

페이지 컴포넌트는 삭제하지 않습니다.

```text
src/pages/**/*
```

## 10. vite-plugin-pages 제거

`vite.config.ts`에서 import와 plugin 등록을 제거합니다.

```ts
import Pages from "vite-plugin-pages";

Pages({
  dirs: [{ dir: "src/app/routes", baseRoute: "" }],
  exclude: ["**/_guards/**"],
  importMode: "async",
});
```

`tsconfig.json`에서 타입 참조를 제거합니다.

```json
{
  "compilerOptions": {
    "types": ["node", "vite/client"]
  }
}
```

`src/vite-env.d.ts`에서 제거합니다.

```ts
/// <reference types="vite-plugin-pages/client-react" />
```

패키지를 제거합니다.

```bash
pnpm remove vite-plugin-pages
```

pnpm store 문제가 나면 기존 store를 명시합니다.

```bash
pnpm remove vite-plugin-pages --store-dir /Users/wookhuh/Library/pnpm/store/v11
```

## 11. 남은 참조 검색

```bash
rg "vite-plugin-pages|~react-pages|virtual:generated-pages|PermissionRoute|menu-route-map|menuRouteMap|src/app/routes"
```

문서에 남긴 설명용 문구를 제외하고 실제 코드 참조가 없어야 합니다.

## 12. 검증

타입 검사:

```bash
pnpm typecheck
```

프로덕션 빌드:

```bash
pnpm build
```

브라우저 검증:

```text
1. API가 내려준 url로 직접 접속
2. 사이드바 메뉴 클릭
3. 권한 없는 url 접속 시 /403 이동
4. API url을 바꾼 뒤 같은 menuId 화면이 렌더링되는지 확인
5. 없는 url 접속 시 404 화면 확인
```

## 주의사항

- URL은 API가 관리하지만 화면 컴포넌트는 프론트 번들에 있어야 합니다.
- 이 문서는 백엔드가 `url`을 정제해서 내려준다는 전제입니다.
- API가 새 `menuId`를 내려주면 프론트의 `MENU_ID`, schema, `menuPageMap`에도 추가해야 합니다.
- `url`이 없는 leaf 메뉴는 이동할 수 없으므로 disabled 처리합니다.
- `menuId`가 같으면 API URL이 바뀌어도 같은 화면을 렌더링합니다.
