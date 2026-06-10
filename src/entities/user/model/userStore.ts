import { create } from "zustand";
import type { TRole } from "@/entities/user/lib/permission";
import type { TMenuPermission } from "@/entities/user/lib/permission/types";

type TUser = {
  id: string;
  role: TRole;
};

interface TUserState {
  currentUser: TUser | null;
  permissionMenus: TMenuPermission[] | null;
  isPermissionInitialized: boolean;
  setCurrentUser: (user: TUser | null) => void;
  setPermissionMenus: (permissionMenus: TMenuPermission[] | null) => void;
  setPermissionInitialized: (isPermissionInitialized: boolean) => void;
  initializePermission: (payload: {
    currentUser: TUser | null;
    permissionMenus: TMenuPermission[] | null;
  }) => void;
}

export const useUserStore = create<TUserState>((set) => ({
  currentUser: null,
  permissionMenus: null,
  // 권한을 mock API에서 받아오기 전까지 라우트 가드 판단을 보류하기 위한 플래그입니다.
  isPermissionInitialized: false,
  setCurrentUser: (currentUser) => set({ currentUser }),
  setPermissionMenus: (permissionMenus) => set({ permissionMenus }),
  setPermissionInitialized: (isPermissionInitialized) =>
    set({ isPermissionInitialized }),
  initializePermission: ({ currentUser, permissionMenus }) =>
    set({
      currentUser,
      permissionMenus,
      isPermissionInitialized: true,
    }),
}));
