import { permissionMenuMock } from "@/entities/user/lib/permission/config";
import type { TPermissionApiResponse } from "@/entities/user/lib/permission/types";

// 실제 API 호출 흐름을 유지하기 위한 mock 응답 지연 시간입니다.
const MOCK_API_DELAY_MS = 300;

const demoUserPermission: TPermissionApiResponse = {
  userId: "demo-user",
  role: "viewer",
  permissions: permissionMenuMock,
};

// fetch를 쓰지 않고도 컴포넌트에서는 비동기 API처럼 다룰 수 있게 합니다.
const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getUserPermissionMockApi = async () => {
  await delay(MOCK_API_DELAY_MS);

  // store에서 권한 데이터를 변경해도 원본 mock이 오염되지 않도록 복사본을 반환합니다.
  return structuredClone(demoUserPermission);
};
