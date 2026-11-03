import { type ReactNode, useCallback, useLayoutEffect, useMemo } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

import { extraPageRoutes } from "@/app/router/extra-page-routes";
import type { TMenuPermission } from "@/entities/user";
import { useMainInfo } from "@/entities/user";
import type { ScreenIdValues } from "@/shared/config";
import { API_ERROR_PAGE_PATHS } from "@/shared/lib/api-error";
import {
  clearNavigation,
  clearScreenRouteResolver,
  getRememberedNavigationSearch,
  initNavigation,
  initScreenRouteResolver,
  rememberNavigationSearch,
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

const applyPathParams = (path: string, pathParams?: ScreenRoutePathParams) => {
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

export const NavigationInitializer = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const rememberedSearch = getRememberedNavigationSearch(location);
  const shouldRestoreSearch =
    navigationType === "POP" &&
    rememberedSearch !== undefined &&
    rememberedSearch !== location.search;
  const { menuPermissions, isMainInfoInitialized } = useMainInfo();
  const screenPathMap = useMemo(
    () => createScreenPathMap(menuPermissions),
    [menuPermissions],
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

  useLayoutEffect(() => {
    initNavigation(navigate);

    return () => {
      clearNavigation(navigate);
    };
  }, [navigate]);

  useLayoutEffect(() => {
    if (!isMainInfoInitialized) {
      clearScreenRouteResolver();
      return;
    }

    initScreenRouteResolver(resolveScreenPath);

    return () => {
      clearScreenRouteResolver(resolveScreenPath);
    };
  }, [isMainInfoInitialized, resolveScreenPath]);

  useLayoutEffect(() => {
    if (shouldRestoreSearch) {
      // POP으로 복원된 과거 쿼리가 마지막 값을 덮어쓰지 않도록 먼저 대체합니다.
      void navigate(
        {
          pathname: location.pathname,
          search: rememberedSearch,
          hash: location.hash,
        },
        { replace: true, state: location.state },
      );
      return;
    }

    rememberNavigationSearch(location);
  }, [location, navigate, rememberedSearch, shouldRestoreSearch]);

  // 화면이 과거 쿼리로 필터를 초기화하거나 API를 호출하지 않도록 복원을 기다립니다.
  return shouldRestoreSearch ? null : children;
};
