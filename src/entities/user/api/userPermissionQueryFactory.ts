import { queryOptions } from "@tanstack/react-query";
import { getUserPermissionApi } from "@/entities/user/api/getUserPermissionApi";

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
