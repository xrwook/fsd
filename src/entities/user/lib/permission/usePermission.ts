import { useCallback } from "react";
import {
  hasChildrenMenuPermission,
  hasMenuPermission,
} from "@/entities/user/lib/permission/config";
import { useUserStore } from "@/entities/user/model/userStore";
import type {
  TMenuPermission,
  TPermissionKey,
} from "@/entities/user/lib/permission/types";

const EMPTY_PERMISSION_MENUS: TMenuPermission[] = [];

export const usePermission = () => {
  const permissionMenus = useUserStore((state) => state.permissionMenus);
  const isPermissionInitialized = useUserStore(
    (state) => state.isPermissionInitialized,
  );

  const resolvedPermissionMenus = permissionMenus ?? EMPTY_PERMISSION_MENUS;

  // 초기화 전에는 권한 데이터가 아직 없으므로 모든 접근을 보류합니다.
  const canAccessMenu = useCallback(
    (menuId: string, permissionKey: TPermissionKey = "read") => {
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
    (menuId: string, permissionKey: TPermissionKey = "read") => {
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
    permissionMenus: resolvedPermissionMenus,
    isPermissionInitialized,
    canAccessMenu,
    canAccessMenuGroup,
  };
};
