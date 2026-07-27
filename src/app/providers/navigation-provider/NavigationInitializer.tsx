import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { extraPageRoutes } from "@/app/router/extra-page-routes";
import type { TMenuPermission } from "@/entities/user";
import { useMainInfo } from "@/entities/user";
import type { ScreenIdValues } from "@/shared/config";
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

        return null;
      }

      return applyPathParams(path, pathParams);
    },
    [isMainInfoInitialized, screenPathMap],
  );

  useEffect(() => {
    initNavigation(navigate);

    return () => {
      clearNavigation();
    };
  }, [navigate]);

  useEffect(() => {
    if (!isMainInfoInitialized) {
      clearScreenRouteResolver();
      return;
    }

    initScreenRouteResolver(resolveScreenPath);

    return () => {
      clearScreenRouteResolver();
    };
  }, [isMainInfoInitialized, resolveScreenPath]);

  return null;
};
