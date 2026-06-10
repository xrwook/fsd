import { getUserPermissionMockApi } from "@/entities/user/api/mocks/getUserPermissionMockApi";
import { axiosInstance } from "@/shared/lib/axios";
import type { TPermissionApiResponse } from "@/entities/user/lib/permission/types";

// 사용자 권한 조회 API를 모사해 라우트/화면 가드에서 공통으로 사용합니다.
export const getUserPermissionApi = async () => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (shouldUseMockApi) {
    if (typeof window === "undefined") {
      return getUserPermissionMockApi();
    }

    return axiosInstance.get<TPermissionApiResponse>("/api/permissions");
  }

  return axiosInstance.get<TPermissionApiResponse>("/api/permissions");
};
