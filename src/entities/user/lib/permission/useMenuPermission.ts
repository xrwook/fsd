import { useCallback } from "react";

import { useGetMenuPermissionQuery } from "../../api";
import { hasChildrenMenuPermission, hasMenuPermission } from "./config";
import type { TMenuId, TMenuPermission, TPermissionKey } from "./types";

const EMPTY_PERMISSION_MENUS: TMenuPermission[] = [];

/**
 * 메뉴 권한을 관리하는 훅입니다.
 */
export const useMenuPermission = () => {
  const {
    data: menuPermission = null,
    data: {
      permissionDescription,
      permissionName,
      permissions: resolvedPermissionMenus = EMPTY_PERMISSION_MENUS,
    } = {},
    isFetched: isPermissionInitialized,
  } = useGetMenuPermissionQuery();

  // 초기화 전에는 권한 데이터가 아직 없으므로 모든 접근을 보류합니다.
  const canAccessMenu = useCallback(
    (menuId: TMenuId, permissionKey: TPermissionKey = "read") => {
      if (!isPermissionInitialized) {
        return false;
      }

      return hasMenuPermission(resolvedPermissionMenus, menuId, permissionKey);
    },
    [isPermissionInitialized, resolvedPermissionMenus],
  );

  // 사이드바/상위 폴더처럼 하위 메뉴 권한까지 포함해서 판단할 때 사용합니다.
  // #TODO
  const canAccessMenuGroup = useCallback(
    (menuId: TMenuId, permissionKey: TPermissionKey = "read") => {
      if (!isPermissionInitialized) {
        return false;
      }

      return hasChildrenMenuPermission(
        resolvedPermissionMenus,
        menuId,
        permissionKey,
      );
    },
    [isPermissionInitialized, resolvedPermissionMenus],
  );

  return {
    menuPermission,
    permissionName: permissionName ?? null,
    permissionDescription: permissionDescription ?? null,
    permissionMenus: resolvedPermissionMenus,
    isPermissionInitialized,
    canAccessMenu,
    canAccessMenuGroup,
  };
};
