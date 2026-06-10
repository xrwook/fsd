export type TRole = "admin" | "editor" | "viewer";

export type TPermissionKey = "read" | "write" | "download";

export interface TMenuPermission {
  id: string;
  parentId: string | null;
  depth: number;
  name: string;
  type: "folder" | "menu";
  expanded?: boolean;
  checked: boolean;
  permissions: Record<TPermissionKey, boolean>;
  children?: TMenuPermission[];
}

export interface TPermissionApiResponse {
  userId: string;
  role: TRole;
  permissions: TMenuPermission[];
}
