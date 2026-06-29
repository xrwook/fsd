import type { ComponentType, LazyExoticComponent } from "react";

import type { TMenuId, TPermissionKey } from "@/entities/user";

export type TExtraPageRoute = {
  path: string;
  parentMenuId: TMenuId;
  requiredPermission: Extract<TPermissionKey, "read" | "write">;
  page: LazyExoticComponent<ComponentType>;
};

export type TExtraPageRouteGroups = Partial<Record<TMenuId, TExtraPageRoute[]>>;
