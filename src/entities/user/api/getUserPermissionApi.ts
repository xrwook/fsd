import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUserPermissionMockApi } from "@/entities/user/api/mocks/getUserPermissionMockApi";
import { permissionApiResponseSchema } from "@/entities/user/lib/permission/schema";
import { axiosInstance } from "@/shared/lib/axios";
import type { TPermissionApiResponse } from "../lib/permission";

// 사용자 권한 조회 API를 모사해 라우트/화면 가드에서 공통으로 사용합니다.
export const getUserPermissionApi = async () => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (shouldUseMockApi) {
    if (typeof window === "undefined") {
      const xxx = permissionApiResponseSchema.parse(await getUserPermissionMockApi());
      return xxx
    }

    try {
      return permissionApiResponseSchema.parse(
        await axiosInstance.get<TPermissionApiResponse>("/api/permissions"),
      );
    } catch {
      return permissionApiResponseSchema.parse(await getUserPermissionMockApi());
    }
  }
  const res =  await axiosInstance.get<TPermissionApiResponse>("/api/permissions");
  return permissionApiResponseSchema.parse(res);
};

export const userPermissionQueryFactory = {
  all: () => ["user-permission"] as const,
  current: () =>
    queryOptions({
      queryKey: [...userPermissionQueryFactory.all(), "current"] as const,
      queryFn: getUserPermissionApi,
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    }),
};

export const useGetUserPermissionQuery = () => {
  return useQuery(userPermissionQueryFactory.current());
};
