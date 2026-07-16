import type { MenuData } from "./types";

export type TMenuPermissionField =
  | "canRead"
  | "canCreate"
  | "canUpdate"
  | "canDelete"
  | "canDownload";

/**
 * API 메뉴 데이터를 화면 권한 체크와 사이드바 렌더링에 맞게 가공한 타입입니다.
 */
export type TMenuPermission = {
  id: MenuData["screenId"];
  menuId: MenuData["menuId"];
  screenId: MenuData["screenId"];
  parentId: MenuData["screenId"] | null;
  depth: number;
  name: MenuData["name"];
  type: "folder" | "menu";
  url: string | null;
  expanded: boolean;
  canRead: MenuData["canRead"];
  canCreate: MenuData["canCreate"];
  canUpdate: MenuData["canUpdate"];
  canDelete: MenuData["canDelete"];
  canDownload: MenuData["canDownload"];
  children: TMenuPermission[];
};
