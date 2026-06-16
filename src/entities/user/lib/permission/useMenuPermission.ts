import { useCallback } from "react";
import {
  hasChildrenMenuPermission,
  hasMenuPermission,
} from "@/entities/user/lib/permission/config";
import { useMenuPermissionStore } from "@/entities/user/model/menuPermissionStore";
import type {
  TMenuId,
  TMenuPermission,
  TPermissionKey,
} from "@/entities/user/lib/permission/types";

const EMPTY_PERMISSION_MENUS: TMenuPermission[] = [];

export const useMenuPermission = () => {
  const menuPermission = useMenuPermissionStore(
    (state) => state.menuPermission,
  );
  const isPermissionInitialized = useMenuPermissionStore(
    (state) => state.isPermissionInitialized,
  );

  const resolvedPermissionMenus =
    menuPermission?.permissions ?? EMPTY_PERMISSION_MENUS;

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
    permissionName: menuPermission?.permissionName ?? null,
    permissionDescription: menuPermission?.permissionDescription ?? null,
    permissionMenus: resolvedPermissionMenus,
    isPermissionInitialized,
    canAccessMenu,
    canAccessMenuGroup,
  };
};
