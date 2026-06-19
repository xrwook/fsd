export type {
  TMenuId,
  TMenuPermission,
  TPermissionKey,
} from "./lib/permission";
export {
  isMenuId,
  MENU_ID,
  useMenuPermission,
} from "./lib/permission";
export { useInitializeMenuPermission } from "./lib/permission/useInitializeMenuPermission";
export { useMenuPermissionStore } from "./model/menuPermissionStore";
