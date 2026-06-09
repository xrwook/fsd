import { useEffect } from "react";
import { getPermissionSetByRole } from "@/entities/user/lib/permission/config";
import { getUserPermissionApi } from "@/entities/user/api";
import { useUserStore } from "@/entities/user/model/userStore";

export const useInitializePermission = () => {
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setPermissionSet = useUserStore((state) => state.setPermissionSet);
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const response = await getUserPermissionApi();

        if (cancelled) {
          return;
        }

        setCurrentUser({
          id: response.userId,
          role: response.role,
        });
        setPermissionSet(response.permissions);
      } catch {
        if (cancelled) {
          return;
        }

        if (currentUser) {
          setPermissionSet(getPermissionSetByRole(currentUser.role));
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [currentUser, setCurrentUser, setPermissionSet]);
};
