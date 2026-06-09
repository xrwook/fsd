import type {
  TPermissionSet,
  TRole,
} from "@/entities/user/lib/permission/types";

export const rolePermissions: Record<TRole, TPermissionSet> = {
  admin: {
    pages: ["home", "post-list", "admin"],
    actions: ["post:create", "post:filter", "post:delete", "button:export"],
  },
  editor: {
    pages: ["home", "post-list"],
    actions: ["post:create", "post:filter"],
  },
  viewer: {
    pages: ["home", "post-list"],
    actions: ["post:filter"],
  },
};

export const isRole = (value: string | null | undefined): value is TRole => {
  if (!value) {
    return false;
  }

  return value in rolePermissions;
};
