import { create } from "zustand";
import type { TRole } from "@/entities/user/lib/permission";

type TUser = {
  id: string;
  role: TRole;
};

interface TUserState {
  currentUser: TUser | null;
  setCurrentUser: (user: TUser | null) => void;
}

export const useUserStore = create<TUserState>((set) => ({
  currentUser: {
    id: "demo-user",
    role: "viewer",
  },
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
