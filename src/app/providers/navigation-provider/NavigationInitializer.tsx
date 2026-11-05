import { useCallback, useEffect, useMemo, useRef } from "react";
import { matchRoutes, useLocation, useNavigate } from "react-router-dom";

import { extraPageRoutes } from "@/app/router/extra-page-routes";
import type { TMenuPermission } from "@/entities/user";
import { useMainInfo } from "@/entities/user";
import type { ScreenIdValues } from "@/shared/config";
import { API_ERROR_PAGE_PATHS } from "@/shared/lib/api-error";
import {
  clearNavigation,
  clearScreenRouteResolver,
  initNavigation,
  initScreenRouteResolver,
  type ScreenRoutePathParams,
} from "@/shared/lib/navigation";
import { flattenTree } from "@/shared/lib/utils";

const PATH_PARAM_PATTERN = /:(\w+)/g;

const resolveExtraPagePath = (parentPath: string, relativePath: string) => {
  const normalizedParentPath = parentPath.replace(/\/+$/, "");
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");

  return `${normalizedParentPath}/${normalizedRelativePath}`;
};

const createScreenPathMap = (menuPermissions: TMenuPermission[]) => {
  const screenPathMap = new Map<ScreenIdValues, string>();
  const flattenedMenus = flattenTree(menuPermissions, (menu) => menu.children);

  for (const menu of flattenedMenus) {
    if (menu.url) {
      screenPathMap.set(menu.screenId, menu.url);
    }
  }

  for (const route of extraPageRoutes) {
    const parentPath = screenPathMap.get(route.parentScreenId);

    if (parentPath) {
      screenPathMap.set(
        route.screenId,
        resolveExtraPagePath(parentPath, route.relativePath),
      );
    }
  }

  return screenPathMap;
};

const applyPathParams = (
  path: string,
  pathParams?: ScreenRoutePathParams,
) => {
  const missingParamNames = new Set<string>();
  const resolvedPath = path.replaceAll(
    PATH_PARAM_PATTERN,
    (placeholder, paramName: string) => {
      const paramValue = pathParams?.[paramName];

      if (paramValue === undefined) {
        missingParamNames.add(paramName);
        return placeholder;
      }

      return encodeURIComponent(String(paramValue));
    },
  );

  if (missingParamNames.size > 0) {
    console.error(
      `[navigation] Route path "${path}" requires path params: ${[
        ...missingParamNames,
      ].join(", ")}.`,
    );

    return null;
  }

  return resolvedPath;
};

export const NavigationInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);
  const { menuPermissions, isMainInfoInitialized } = useMainInfo();
  const screenPathMap = useMemo(
    () => createScreenPathMap(menuPermissions),
    [menuPermissions],
  );
  const screenRoutes = useMemo(
    () => Array.from(screenPathMap, ([id, path]) => ({ id, path })),
    [screenPathMap],
  );

  const resolveScreenPath = useCallback(
    (screenId: ScreenIdValues, pathParams?: ScreenRoutePathParams) => {
      if (!isMainInfoInitialized) {
        return null;
      }

      const path = screenPathMap.get(screenId);

      if (!path) {
        console.error(
          `[navigation] Route path for screen "${screenId}" was not found in API menu or extra page routes.`,
        );
        navigate(API_ERROR_PAGE_PATHS.accessDenied, { replace: true });

        return null;
      }

      return applyPathParams(path, pathParams);
    },
    [isMainInfoInitialized, navigate, screenPathMap],
  );

  useEffect(() => {
    initNavigation(navigate);

    return () => {
      clearNavigation(navigate);
    };
  }, [navigate]);

  useEffect(() => {
    if (!isMainInfoInitialized) {
      clearScreenRouteResolver();
      return;
    }

    initScreenRouteResolver(resolveScreenPath);

    return () => {
      clearScreenRouteResolver(resolveScreenPath);
    };
  }, [isMainInfoInitialized, resolveScreenPath]);

  // 메뉴가 바뀌면 모든 쿼리를 초기화하고, 같은 메뉴의 하위 화면 이동은 쿼리를 유지합니다.
  useEffect(() => {
    if (!isMainInfoInitialized) return;

    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = location.pathname;

    // 최초 로딩과 같은 페이지에서의 탭/쿼리 변경은 초기화하지 않습니다.
    if (previousPathname === location.pathname) return;

    const getMenuScreenId = (pathname: string) => {
      const screenId = matchRoutes(screenRoutes, pathname)?.at(-1)?.route.id;
      if (!screenId) return undefined;

      // 상세/등록/수정 화면은 라우트에 등록된 상위 메뉴와 같은 메뉴로 판단합니다.
      return (
        extraPageRoutes.find((route) => route.screenId === screenId)
          ?.parentScreenId ?? screenId
      );
    };

    const currentMenuScreenId = getMenuScreenId(location.pathname);
    if (!currentMenuScreenId) return;
    if (currentMenuScreenId === getMenuScreenId(previousPathname)) return;

    if (!location.search) return;

    void navigate(
      {
        pathname: location.pathname,
        search: "",
        hash: location.hash,
      },
      { replace: true, state: location.state },
    );
  }, [isMainInfoInitialized, location, navigate, screenRoutes]);

  return null;
};
