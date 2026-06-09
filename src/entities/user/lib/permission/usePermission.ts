import {
  getPermissionSetByRole,
  isRole,
} from "@/entities/user/lib/permission/config";
import { useUserStore } from "@/entities/user/model/userStore";
import type {
  TActionPermission,
  TPagePermission,
  TPermissionSet,
  TRole,
} from "@/entities/user/lib/permission/types";

export const usePermission = () => {
  const role = useUserStore((state) => state.currentUser?.role);
  const permissionSet = useUserStore((state) => state.permissionSet);

  const resolvedRole: TRole | null = isRole(role) ? role : null;
  const resolvedPermissionSet: TPermissionSet | null =
    permissionSet ?? (resolvedRole ? getPermissionSetByRole(resolvedRole) : null);

  const canAccessPage = (permission: TPagePermission) => {
    if (!resolvedPermissionSet) {
      return false;
    }

    return resolvedPermissionSet.pages.includes(permission);
  };

  const canAccessAction = (permission: TActionPermission) => {
    if (!resolvedPermissionSet) {
      return false;
    }

    return resolvedPermissionSet.actions.includes(permission);
  };

  return {
    role: resolvedRole,
    canAccessPage,
    canAccessAction,
  };
};
