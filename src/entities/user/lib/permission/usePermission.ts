import { isRole, rolePermissions } from "@/entities/user/lib/permission/config";
import { useUserStore } from "@/entities/user/model/userStore";
import type {
  TActionPermission,
  TPagePermission,
  TRole,
} from "@/entities/user/lib/permission/types";

export const usePermission = () => {
  const role = useUserStore((state) => state.currentUser?.role);

  const resolvedRole: TRole | null = isRole(role) ? role : null;

  const canAccessPage = (permission: TPagePermission) => {
    if (!resolvedRole) {
      return false;
    }

    return rolePermissions[resolvedRole].pages.includes(permission);
  };

  const canAccessAction = (permission: TActionPermission) => {
    if (!resolvedRole) {
      return false;
    }

    return rolePermissions[resolvedRole].actions.includes(permission);
  };

  return {
    role: resolvedRole,
    canAccessPage,
    canAccessAction,
  };
};
