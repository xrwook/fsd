import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest, type Response } from "@/shared/lib/api";
import {
  getKeycloakInstance,
  isKeycloakEnabled,
} from "@/shared/lib/keycloak";

import type { MainInfoData } from "../lib/main-info";

type MainInfoResponse = Response<MainInfoData>;
type RecentVisitResponse = Response<string>;
export type ReconsentRequiredExistsResponse = Response<boolean>;

const reconsentRequests = new Map<
  string,
  Promise<boolean>
>();

const getReconsentSessionKey = () => {
  return getKeycloakInstance()?.sessionId ?? "anonymous";
};

const isReconsentQueryEnabled = () => {
  if (!isKeycloakEnabled()) {
    return true;
  }

  return Boolean(getKeycloakInstance()?.authenticated);
};

const requestMainInfo = async () => {
  const response = await apiRequest<MainInfoResponse>(
    "get",
    "/permissions",
    undefined,
    { skipGlobalErrorPage: true, skipScreenId: true },
  );

  return response.data.data;
};

const requestReconsentRequiredExists = async () => {
  const response = await apiRequest<ReconsentRequiredExistsResponse>(
    "post",
    "/home/main/terms/reconsent-required/exists",
  );

  return response.data.data;
};

export const getReconsentRequiredExistsApi = () => {
  const sessionKey = getReconsentSessionKey();
  const cachedRequest = reconsentRequests.get(sessionKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = requestReconsentRequiredExists();
  reconsentRequests.set(sessionKey, request);

  return request;
};

// 사용자/파트너/약관/메뉴 정보를 조회해 라우트 가드와 사이드 메뉴에서 공통으로 사용합니다.
export const getMainInfoApi = async (): Promise<MainInfoData> => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (shouldUseMockApi) {
    const { getMainInfoMockApi } = await import("./mocks/getMainInfoMockApi");

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

export const postRecentVisitApi = async (screenId: string) => {
  const response = await apiRequest<RecentVisitResponse>(
    "post",
    "/v1/backoffice/home/main/recent-visits",
    undefined,
    { screenId },
  );

  return response.data.data;
};

export const usePostRecentVisitMutation = () => {
  return useMutation({
    mutationFn: postRecentVisitApi,
    retry: false,
  });
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
  reconsentRequiredExists: (sessionKey: string) =>
    queryOptions({
      queryKey: ["reconsent-required-exists", sessionKey] as const,
      queryFn: getReconsentRequiredExistsApi,
      enabled: isReconsentQueryEnabled(),
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }),
};

export const useGetReconsentRequiredExistsApiQuery = () => {
  const sessionKey = getReconsentSessionKey();

  return useQuery(mainInfoQueryFactory.reconsentRequiredExists(sessionKey));
};

export const useGetMainInfoQuery = () => {
  return useQuery(mainInfoQueryFactory.current());
};
