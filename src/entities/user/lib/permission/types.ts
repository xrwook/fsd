import type { TMenuId } from "./menuIds";

export type { TMenuId } from "./menuIds";

/**
 * 메뉴별로 검사할 수 있는 권한 키 타입입니다.
 */
export type TPermissionKey = "read" | "write" | "download";

/**
 * API가 내려주는 재귀 메뉴 트리의 단일 노드 타입입니다.
 */
export type TMenuPermission = {
  id: TMenuId;
  parentId: TMenuId | null;
  depth: number;
  name: string;
  type: "folder" | "menu";
  url?: string | null;
  expanded?: boolean;
  checked: boolean;
  permissions: Record<TPermissionKey, boolean>;
  children?: TMenuPermission[];
};

/**
 * 사용자 권한 조회 API의 응답 타입입니다.
 */
export type TMenuPermissionApiResponse = {
  permissionName: string;
  permissionDescription: string;
  permissions: TMenuPermission[];
};
