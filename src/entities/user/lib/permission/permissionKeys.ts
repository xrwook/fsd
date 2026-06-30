import type { TPermissionKey } from "./types";

export const PERMISSION_KEY = {
  READ: "read",
  WRITE: "write",
  DOWNLOAD: "download",
} as const satisfies Record<string, TPermissionKey>;
