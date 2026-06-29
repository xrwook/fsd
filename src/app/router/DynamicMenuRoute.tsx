import { matchRoutes, Navigate, useLocation } from "react-router-dom";

import { useMenuPermission } from "@/entities/user";
import NotFoundPage from "@/pages/not-found";
import { flattenTree } from "@/shared/lib/utils";

import { extraPageRoutes, type TExtraPageRoute } from "./extra-page-routes";
import { pageMap } from "./menu-page-map";

type TResolvedExtraPageRoute = TExtraPageRoute & {
  path: string;
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
  const { permissionMenus, isPermissionInitialized, canAccessMenu } =
    useMenuPermission();

  // 권한 메뉴를 아직 모르는 시점에는 404/403 판단을 보류합니다.
  if (!isPermissionInitialized) {
    return null;
  }

  const flattenedPermissionMenus = flattenTree(
    permissionMenus,
    (menu) => menu.children,
  );

  const resolvedExtraPageRoutes: TResolvedExtraPageRoute[] =
    extraPageRoutes.flatMap((route) => {
      const parentMenu = flattenedPermissionMenus.find(
        (menu) => menu.id === route.parentMenuId,
      );

      if (!parentMenu?.url) {
        return [];
      }

      return [
        {
          ...route,
          path: resolveExtraPagePath(parentMenu.url, route.relativePath),
        },
      ];
    });

  const extraRoute =
    matchRoutes<TResolvedExtraPageRoute>(resolvedExtraPageRoutes, location)?.at(
      -1,
    )?.route ?? null;

  if (extraRoute) {
    if (
      !canAccessMenu(extraRoute.parentMenuId, extraRoute.requiredPermission)
    ) {
      return <Navigate to="/403" replace />;
    }

    const ExtraPage = extraRoute.page;

    return <ExtraPage />;
  }

  // 현재 URL과 API 메뉴의 url을 직접 비교해서 어떤 메뉴 화면인지 찾습니다.
  const currentUrl =
    flattenedPermissionMenus.find((menu) => {
      return menu.url === location.pathname;
    }) ?? null;

  // API 메뉴에 없는 URL이면 프론트가 렌더링할 메뉴 화면도 없습니다.
  if (!currentUrl) {
    return <NotFoundPage />;
  }

  // URL은 존재하지만 사용자의 read 권한이 없으면 접근을 차단합니다.
  if (!canAccessMenu(currentUrl.id)) {
    return <Navigate to="/403" replace />;
  }

  // menuId에 연결된 page component가 없으면 아직 프론트에 구현되지 않은 메뉴입니다.
  const MenuPage = pageMap[currentUrl.id];

  if (!MenuPage) {
    return <NotFoundPage />;
  }

  return <MenuPage />;
};
