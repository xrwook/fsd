import { queryOptions, useQuery } from "@tanstack/react-query";
import { getMenuPermissionMockApi } from "@/entities/user/api/mocks/getMenuPermissionMockApi";
import { menuPermissionApiResponseSchema } from "@/entities/user/lib/permission/schema";
import { axiosInstance } from "@/shared/lib/axios";

// 유저별 메뉴 권한을 조회해 라우트 가드와 사이드 메뉴에서 공통으로 사용합니다.
export const getMenuPermissionApi = async () => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (shouldUseMockApi) {
    if (typeof window === "undefined") {
      return menuPermissionApiResponseSchema.parse(
        await getMenuPermissionMockApi(),
      );
    }

    try {
      return menuPermissionApiResponseSchema.parse(
        await axiosInstance.get<unknown>("/api/permissions"),
      );
    } catch {
      return menuPermissionApiResponseSchema.parse(
        await getMenuPermissionMockApi(),
      );
    }
  }

  return menuPermissionApiResponseSchema.parse(
    await axiosInstance.get<unknown>("/api/permissions"),
  );
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
