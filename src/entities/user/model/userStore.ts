import { create } from "zustand";
import type { TRole } from "@/entities/user/lib/permission";
import { getPermissionSetByRole } from "@/entities/user/lib/permission/config";
import type { TPermissionSet } from "@/entities/user/lib/permission/types";

type TUser = {
  id: string;
  role: TRole;
};

interface TUserState {
  currentUser: TUser | null;
  permissionSet: TPermissionSet | null;
  setCurrentUser: (user: TUser | null) => void;
  setPermissionSet: (permissionSet: TPermissionSet | null) => void;
}

export const useUserStore = create<TUserState>((set) => ({
  currentUser: {
    id: "demo-user",
    role: "viewer",
  },
  permissionSet: getPermissionSetByRole("viewer"),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setPermissionSet: (permissionSet) => set({ permissionSet }),
}));
