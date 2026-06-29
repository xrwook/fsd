import type { ComponentType, LazyExoticComponent } from "react";

import type { PERMISSION_KEY, TMenuId } from "@/entities/user";
import type { ValuesType } from "utility-types";

type RequiredPermission = Extract<ValuesType<typeof PERMISSION_KEY>, "read" | "write">;

export type TExtraPageRoute = {
  path: string;
  parentMenuId: TMenuId;
  requiredPermission: RequiredPermission;
  page: LazyExoticComponent<ComponentType>;
};

export type TExtraPageRouteGroups = Partial<Record<TMenuId, TExtraPageRoute[]>>;
