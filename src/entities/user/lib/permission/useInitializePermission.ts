import { useEffect } from "react";
import { useGetUserPermissionQuery } from "@/entities/user/api";
import { useUserStore } from "@/entities/user/model/userStore";

export const useInitializePermission = () => {
  const setInitializePermission = useUserStore(
    (state) => state.setInitializePermission,
  );
  const permissionQuery = useGetUserPermissionQuery();

  useEffect(() => {
    if (!permissionQuery.isSuccess) {
      return;
    }

    // 권한 응답이 들어온 뒤에만 라우트/버튼 가드가 실제 판단을 시작합니다.
    setInitializePermission(permissionQuery.data);
  }, [
    setInitializePermission,
    permissionQuery.data,
    permissionQuery.isSuccess,
  ]);

  useEffect(() => {
    if (!permissionQuery.isError) {
      return;
    }

    // 실패해도 초기화는 끝난 상태로 두어 라우트가 무한 대기하지 않게 합니다.
    setInitializePermission(null);
  }, [setInitializePermission, permissionQuery.isError]);
};
