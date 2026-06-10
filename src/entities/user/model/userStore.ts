import { create } from "zustand";
import type { TMenuPermission } from "@/entities/user/lib/permission/types";

interface TUserState {
  permissionMenus: TMenuPermission[] | null;
  isPermissionInitialized: boolean;
  setPermissionMenus: (permissionMenus: TMenuPermission[] | null) => void;
  setPermissionInitialized: (isPermissionInitialized: boolean) => void;
  initializePermission: (permissionMenus: TMenuPermission[] | null) => void;
}

export const useUserStore = create<TUserState>((set) => ({
  permissionMenus: null,
  // 권한을 mock API에서 받아오기 전까지 라우트 가드 판단을 보류하기 위한 플래그입니다.
  isPermissionInitialized: false,
  setPermissionMenus: (permissionMenus) => set({ permissionMenus }),
  setPermissionInitialized: (isPermissionInitialized) =>
    set({ isPermissionInitialized }),
  initializePermission: (permissionMenus) =>
    set({
      permissionMenus,
      isPermissionInitialized: true,
    }),
}));
