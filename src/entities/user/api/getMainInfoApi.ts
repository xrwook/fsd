import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest, type Response } from "@/shared/lib/api";

import type { MainInfoData } from "../lib/main-info";
import { getMainInfoMockApi } from "./mocks/getMainInfoMockApi";

type MainInfoResponse = Response<MainInfoData>;

const requestMainInfo = async () => {
  const response = await apiRequest<MainInfoResponse>(
    "get",
    "/permissions",
    undefined,
    { skipScreenId: true },
  );

  return response.data.data;
};

// 사용자/파트너/약관/메뉴 정보를 조회해 라우트 가드와 사이드 메뉴에서 공통으로 사용합니다.
export const getMainInfoApi = async (): Promise<MainInfoData> => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (shouldUseMockApi) {
    if (typeof window === "undefined") {
      return getMainInfoMockApi();
    }

    try {
      return await requestMainInfo();
    } catch {
      return getMainInfoMockApi();
    }
  }

  return requestMainInfo();
};

export const mainInfoQueryFactory = {
  all: () => ["main-info"] as const,
  current: () =>
    queryOptions({
      queryKey: [...mainInfoQueryFactory.all(), "current"] as const,
      queryFn: getMainInfoApi,
      staleTime: 0,
      gcTime: 0,
      refetchInterval: 10 * 1000,
      refetchOnWindowFocus: true,
    }),
};

export const useGetMainInfoQuery = () => {
  return useQuery(mainInfoQueryFactory.current());
};
