import type { ComponentType, LazyExoticComponent } from "react";
import type { ValuesType } from "utility-types";

import type { PERMISSION_KEY, TMenuId } from "@/entities/user";

type RequiredPermission = Extract<
  ValuesType<typeof PERMISSION_KEY>,
  "read" | "write"
>;

export type TExtraPageProps = {
  parentPath: string;
  parentMenuId: TMenuId;
};

export type TExtraPageRoute = {
  relativePath: string;
  parentMenuId: TMenuId;
  requiredPermission: RequiredPermission;
  page: LazyExoticComponent<ComponentType<TExtraPageProps>>;
};

export type TExtraPageRouteGroups = Partial<Record<TMenuId, TExtraPageRoute[]>>;
