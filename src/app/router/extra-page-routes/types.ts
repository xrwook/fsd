import type { ComponentType, LazyExoticComponent } from "react";

import type { TMenuPermissionField } from "@/entities/user";
import type { ScreenIdValues } from "@/shared/config";

export type TExtraPageProps = {
  parentPath: string;
  parentScreenId: ScreenIdValues;
};

export type TExtraPageRoute = {
  relativePath: string;
  parentScreenId: ScreenIdValues;
  screenId: ScreenIdValues;
  requirePermission: TMenuPermissionField;
  pages: LazyExoticComponent<ComponentType<TExtraPageProps>>;
};

export type TExtraPageRouteGroups = Partial<
  Record<ScreenIdValues, TExtraPageRoute[]>
>;
