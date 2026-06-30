import { queryOptions, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/shared/lib/axios";

import type { TMenuPermissionApiResponse } from "../lib/permission";
import { getMenuPermissionMockApi } from "./mocks/getMenuPermissionMockApi";

// 유저별 메뉴 권한을 조회해 라우트 가드와 사이드 메뉴에서 공통으로 사용합니다.
export const getMenuPermissionApi =
  async (): Promise<TMenuPermissionApiResponse> => {
    const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

    if (shouldUseMockApi) {
      if (typeof window === "undefined") {
        return getMenuPermissionMockApi();
      }

      try {
        return await axiosInstance.get<TMenuPermissionApiResponse>(
          "/api/permissions",
        );
      } catch {
        return getMenuPermissionMockApi();
      }
    }

    return axiosInstance.get<TMenuPermissionApiResponse>("/api/permissions");
  };

export const menuPermissionQueryFactory = {
  all: () => ["menu-permission"] as const,
  current: () =>
    queryOptions({
      queryKey: [...menuPermissionQueryFactory.all(), "current"] as const,
      queryFn: getMenuPermissionApi,
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    }),
};

export const useGetMenuPermissionQuery = () => {
  return useQuery(menuPermissionQueryFactory.current());
};
