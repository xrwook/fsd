import type { ComponentType, LazyExoticComponent } from "react";

import type { TMenuPermissionField } from "@/entities/user";
import type { ScreenIdValues } from "@/shared/config";

export type TExtraPageProps = {
  parentPath: string;
};

export type TExtraPageRoute = {
  relativePath: string;
  parentMenuId: ScreenIdValues;
  screenId: ScreenIdValues;
  requirePermission: TMenuPermissionField;
  pages: LazyExoticComponent<ComponentType<TExtraPageProps>>;
};

export type TExtraPageRouteGroups = Partial<
  Record<ScreenIdValues, TExtraPageRoute[]>
>;
