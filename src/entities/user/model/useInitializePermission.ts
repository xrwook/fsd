import { useEffect } from "react";
import { getUserPermissionApi } from "@/entities/user/api";
import { useUserStore } from "@/entities/user/model/userStore";

export const useInitializePermission = () => {
  const initializePermission = useUserStore(
    (state) => state.initializePermission,
  );

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const response = await getUserPermissionApi();

        if (cancelled) {
          return;
        }

        // 권한 응답이 들어온 뒤에만 라우트/버튼 가드가 실제 판단을 시작합니다.
        initializePermission({
          currentUser: {
            id: response.userId,
            role: response.role,
          },
          permissionMenus: response.permissions,
        });
      } catch {
        if (cancelled) {
          return;
        }

        // 실패해도 초기화는 끝난 상태로 두어 라우트가 무한 대기하지 않게 합니다.
        initializePermission({
          currentUser: null,
          permissionMenus: null,
        });
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [initializePermission]);
};
