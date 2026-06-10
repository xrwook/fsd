import { getUserPermissionMockApi } from "@/entities/user/api/mocks/getUserPermissionMockApi";
import { permissionApiResponseSchema } from "@/entities/user/lib/permission/schema";
import { axiosInstance } from "@/shared/lib/axios";
import type { TPermissionApiResponse } from "@/entities/user/lib/permission/types";

const validateUserPermissionResponse = (
  response: unknown,
): TPermissionApiResponse => {
  const result = permissionApiResponseSchema.safeParse(response);

  if (!result.success) {
    throw new Error(
      `[permission-api] invalid response data: ${result.error.message}`,
    );
  }

  return result.data;
};

// 사용자 권한 조회 API를 모사해 라우트/화면 가드에서 공통으로 사용합니다.
export const getUserPermissionApi = async () => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (shouldUseMockApi) {
    if (typeof window === "undefined") {
      const response = await getUserPermissionMockApi();

      return validateUserPermissionResponse(response);
    }

    try {
      const response = await axiosInstance.get<unknown>("/api/permissions");

      return validateUserPermissionResponse(response);
    } catch {
      const response = await getUserPermissionMockApi();

      return validateUserPermissionResponse(response);
    }
  }

  const response = await axiosInstance.get<unknown>("/api/permissions");

  return validateUserPermissionResponse(response);
};
