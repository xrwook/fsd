import type { ComponentType, LazyExoticComponent } from "react";

import type { TMenuId, TPermissionKey } from "@/entities/user";

type RequiredPermission = Extract<TPermissionKey, "read" | "write">;

export type TExtraPageProps = {
  parentPath: string;
  pageId: TMenuId;
};

export type TExtraPageRoute = {
  relativePath: string;
  parentMenuId: TMenuId;
  requiredPermission: RequiredPermission;
  page: LazyExoticComponent<ComponentType<TExtraPageProps>>;
};

export type TExtraPageRouteGroups = Partial<Record<TMenuId, TExtraPageRoute[]>>;
