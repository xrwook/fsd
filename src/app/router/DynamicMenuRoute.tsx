import type { ReactNode } from "react";
import {
  matchRoutes,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { type TMenuPermissionField, useMainInfo } from "@/entities/user";
import NotFoundPage from "@/pages/not-found";
import type { ScreenIdValues } from "@/shared/config";
import { flattenTree } from "@/shared/lib/utils";

import { extraPageRoutes, type TExtraPageRoute } from "./extra-page-routes";
import { pageMap } from "./menu-page-map";
import { PageRequestScope } from "./PageRequestScope";

type TResolvedExtraPageRoute = TExtraPageRoute & {
  path: string;
  parentPath: string;
};

type TAuthorizedRouteRenderParams = {
  path: string | null;
  requestScreenId?: ScreenIdValues;
  screenId: ScreenIdValues;
  permissionScreenId: ScreenIdValues;
  permissionField?: TMenuPermissionField;
  element: ReactNode;
};

const resolveExtraPagePath = (parentPath: string, relativePath: string) => {
  const normalizedParentPath = parentPath.replace(/\/+$/, "");
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");

  return `${normalizedParentPath}/${normalizedRelativePath}`;
};

/**
 * 현재 URL을 API 메뉴의 url과 비교하여 어떤 메뉴 화면인지 찾고, 권한이 있으면 해당 페이지 컴포넌트를 렌더링합니다.
 * @returns
 */
export const DynamicMenuRoute = () => {
  const location = useLocation();
  const { menuPermissions, isMainInfoInitialized, canAccessMenu } =
    useMainInfo();

  // 권한 메뉴를 아직 모르는 시점에는 404/403 판단을 보류합니다.
  if (!isMainInfoInitialized) {
    return null;
  }

  const flattenedPermissionMenus = flattenTree(
    menuPermissions,
    (menu) => menu.children,
  );

  const renderAuthorizedRoute = ({
    path,
    requestScreenId,
    screenId,
    permissionScreenId,
    permissionField = "canRead",
    element,
  }: TAuthorizedRouteRenderParams) => {
    if (!path || !screenId || !permissionScreenId) {
      return <NotFoundPage />;
    }

    if (!canAccessMenu(permissionScreenId, permissionField)) {
      return <Navigate to="/403" replace />;
    }

    return (
      <PageRequestScope screenId={requestScreenId ?? screenId}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </PageRequestScope>
    );
  };

  const routes: TResolvedExtraPageRoute[] = extraPageRoutes.flatMap((route) => {
    const parentMenu = flattenedPermissionMenus.find(
      (menu) => menu.screenId === route.parentScreenId,
    );

    if (!parentMenu?.url) {
      return [];
    }

    return [
      {
        ...route,
        parentPath: parentMenu.url,
        path: resolveExtraPagePath(parentMenu.url, route.relativePath),
      },
    ];
  });

  const extraRoute =
    matchRoutes<TResolvedExtraPageRoute>(routes, location)?.at(-1) ?? null;

  if (extraRoute) {
    const { route } = extraRoute;
    const ExtraPage = route.pages;

    return renderAuthorizedRoute({
      path: route.path,
      requestScreenId: route.parentScreenId,
      screenId: route.screenId,
      permissionScreenId: route.parentScreenId,
      permissionField: route.requirePermission,
      element: (
        <ExtraPage
          parentPath={route.parentPath}
          parentScreenId={route.parentScreenId}
        />
      ),
    });
  }

  // 현재 URL과 API 메뉴의 url을 직접 비교해서 어떤 메뉴 화면인지 찾습니다.
  const currentMenu =
    flattenedPermissionMenus.find((menu) => {
      return menu.url === location.pathname;
    }) ?? null;

  // API 메뉴에 없는 URL이면 프론트가 렌더링할 메뉴 화면도 없습니다.
  if (!currentMenu?.url || !currentMenu.screenId) {
    return <NotFoundPage />;
  }

  // screenId에 연결된 page component가 없으면 아직 프론트에 구현되지 않은 메뉴입니다.
  const MenuPage = pageMap[currentMenu.screenId];

  if (!MenuPage) {
    return <NotFoundPage />;
  }

  return renderAuthorizedRoute({
    path: currentMenu.url,
    screenId: currentMenu.screenId,
    permissionScreenId: currentMenu.screenId,
    element: <MenuPage screenId={currentMenu.screenId} />,
  });
};
