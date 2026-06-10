import { useEffect } from "react";
import { getUserPermissionApi } from "@/entities/user/api";
import { useUserStore } from "@/entities/user/model/userStore";

export const useInitializePermission = () => {
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setPermissionMenus = useUserStore((state) => state.setPermissionMenus);
  const setPermissionInitialized = useUserStore(
    (state) => state.setPermissionInitialized,
  );

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
        setPermissionMenus(response.permissions);
        // 권한 응답이 들어온 뒤에만 라우트/버튼 가드가 실제 판단을 시작합니다.
        setPermissionInitialized(true);
      } catch {
        if (cancelled) {
          return;
        }

        setCurrentUser(null);
        setPermissionMenus(null);
        // 실패해도 초기화는 끝난 상태로 두어 라우트가 무한 대기하지 않게 합니다.
        setPermissionInitialized(true);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [setCurrentUser, setPermissionInitialized, setPermissionMenus]);
};
