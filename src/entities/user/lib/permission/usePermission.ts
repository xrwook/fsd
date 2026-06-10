import {
  hasDescendantMenuPermission,
  hasMenuPermission,
  isRole,
} from "@/entities/user/lib/permission/config";
import { useUserStore } from "@/entities/user/model/userStore";
import type {
  TPermissionKey,
  TRole,
} from "@/entities/user/lib/permission/types";

export const usePermission = () => {
  const role = useUserStore((state) => state.currentUser?.role);
  const permissionMenus = useUserStore((state) => state.permissionMenus);
  const isPermissionInitialized = useUserStore(
    (state) => state.isPermissionInitialized,
  );

  const resolvedRole: TRole | null = isRole(role) ? role : null;
  const resolvedPermissionMenus = permissionMenus ?? [];

  // 초기화 전에는 권한 데이터가 아직 없으므로 모든 접근을 보류합니다.
  const canAccessMenu = (
    menuId: string,
    permissionKey: TPermissionKey = "read",
  ) => {
    if (!isPermissionInitialized) {
      return false;
    }

    return hasMenuPermission(resolvedPermissionMenus, menuId, permissionKey);
  };

  // 사이드바/상위 폴더처럼 하위 메뉴 권한까지 포함해서 판단할 때 사용합니다.
  const canAccessMenuGroup = (
    menuId: string,
    permissionKey: TPermissionKey = "read",
  ) => {
    if (!isPermissionInitialized) {
      return false;
    }

    return hasDescendantMenuPermission(
      resolvedPermissionMenus,
      menuId,
      permissionKey,
    );
  };

  return {
    role: resolvedRole,
    permissionMenus: resolvedPermissionMenus,
    isPermissionInitialized,
    canAccessMenu,
    canAccessMenuGroup,
  };
};