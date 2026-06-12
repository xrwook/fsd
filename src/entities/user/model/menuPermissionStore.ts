import { create } from "zustand";
import type { TMenuPermissionApiResponse } from "@/entities/user/lib/permission/types";

interface TMenuPermissionState {
  menuPermission: TMenuPermissionApiResponse | null;
  isPermissionInitialized: boolean;
  setInitializePermission: (
    menuPermission: TMenuPermissionApiResponse | null,
  ) => void;
}

export const useMenuPermissionStore = create<TMenuPermissionState>(
  (set) => ({
    menuPermission: null,
    // 유저별 메뉴 권한을 받아오기 전까지 라우트/사이드 메뉴 판단을 보류하기 위한 플래그입니다.
    isPermissionInitialized: false,
    setInitializePermission: (menuPermission) =>
      set({
        menuPermission,
        isPermissionInitialized: true,
      }),
  }),
);
