import type { ComponentType, LazyExoticComponent } from "react";

import type { TMenuPermissionField } from "@/entities/user";

export type TExtraPageProps = {
  parentPath: string;
};

export type TExtraPageRoute = {
  relativePath: string;
  parentMenuId: string;
  screenId: string;
  requirePermission: TMenuPermissionField;
  pages: LazyExoticComponent<ComponentType<TExtraPageProps>>;
};

export type TExtraPageRouteGroups = Record<string, TExtraPageRoute[]>;
