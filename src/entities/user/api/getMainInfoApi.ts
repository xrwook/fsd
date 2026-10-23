import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { apiRequest, type Response } from "@/shared/lib/api";
import { getKeycloakInstance, isKeycloakEnabled } from "@/shared/lib/keycloak";

import type { MainInfoData, UserInfo } from "../lib/main-info";

type MainInfoResponse = Response<MainInfoData>;
type RecentVisitResponse = Response<string>;
export type ReconsentRequiredExistsResponse = Response<boolean>;
export type UserStatusData = {
  userStatus: UserInfo["userStatus"];
};
export type UserStatusResponse = Response<UserStatusData>;

const ANONYMOUS_SESSION_KEY = "anonymous";
const RECONSENT_STORAGE_KEY = "reconsent-required-exists";
const USER_STATUS_STORAGE_KEY = "user-status";

const reconsentRequests = new Map<string, Promise<boolean>>();
const userStatusRequests = new Map<string, Promise<UserStatusData>>();
let activeSessionKey: string | null = null;

const getSessionKey = () => {
  return getKeycloakInstance()?.sessionId ?? ANONYMOUS_SESSION_KEY;
};

const isSessionQueryEnabled = () => {
  if (!isKeycloakEnabled()) {
    return true;
  }

  return Boolean(getKeycloakInstance()?.authenticated);
};

const getSessionStorageValue = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    return window.sessionStorage.getItem(key) ?? undefined;
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 메모리 캐시만 사용합니다.
  }
};

const syncActiveSession = (sessionKey: string) => {
  if (activeSessionKey === sessionKey) {
    return;
  }

  reconsentRequests.clear();
  userStatusRequests.clear();
  activeSessionKey = sessionKey;
};

const setSessionStorageValue = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 메모리 캐시만 사용합니다.
  }
};

type SessionRequestOptions<T> = {
  requests: Map<string, Promise<T>>;
  sessionKey: string;
  persistedValue: T | undefined;
  request: () => Promise<T>;
  persist: (value: T) => void;
};

const getSessionRequest = <T>({
  requests,
  sessionKey,
  persistedValue,
  request: requestFn,
  persist,
}: SessionRequestOptions<T>) => {
  syncActiveSession(sessionKey);

  const cachedRequest = requests.get(sessionKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request =
    persistedValue === undefined
      ? requestFn().then((result) => {
          persist(result);
          return result;
        })
      : Promise.resolve(persistedValue);

  const trackedRequest = request.catch((error: unknown) => {
    if (requests.get(sessionKey) === trackedRequest) {
      requests.delete(sessionKey);
    }

    throw error;
  });

  requests.set(sessionKey, trackedRequest);

  return trackedRequest;
};

const getPersistedReconsentResult = (sessionKey: string) => {
  if (!isKeycloakEnabled() || sessionKey === ANONYMOUS_SESSION_KEY) {
    return;
  }

  const value = getSessionStorageValue(
    `${RECONSENT_STORAGE_KEY}:${sessionKey}`,
  );

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }
};

const persistReconsentResult = (sessionKey: string, value: boolean) => {
  if (!isKeycloakEnabled() || sessionKey === ANONYMOUS_SESSION_KEY) {
    return;
  }

  setSessionStorageValue(
    `${RECONSENT_STORAGE_KEY}:${sessionKey}`,
    String(value),
  );
};

export const reconsentQueryKey = (sessionKey = getSessionKey()) => {
  return ["reconsent-required-exists", sessionKey] as const;
};

export const setReconsentCache = (value: boolean) => {
  const sessionKey = getSessionKey();

  syncActiveSession(sessionKey);
  persistReconsentResult(sessionKey, value);
  reconsentRequests.set(sessionKey, Promise.resolve(value));
};

export const userStatusQueryKey = (sessionKey = getSessionKey()) => {
  return ["user-status", sessionKey] as const;
};

export const setUserStatusCache = (
  userStatus: UserStatusData["userStatus"],
) => {
  const sessionKey = getSessionKey();
  const value = { userStatus };

  syncActiveSession(sessionKey);
  persistUserStatus(sessionKey, value);
  userStatusRequests.set(sessionKey, Promise.resolve(value));
};

const isUserStatusData = (value: unknown): value is UserStatusData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Partial<UserStatusData>;

  return typeof data.userStatus === "string";
};

const getPersistedUserStatus = (sessionKey: string) => {
  if (!isKeycloakEnabled() || sessionKey === ANONYMOUS_SESSION_KEY) {
    return;
  }

  const value = getSessionStorageValue(
    `${USER_STATUS_STORAGE_KEY}:${sessionKey}`,
  );

  if (!value) {
    return;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    return isUserStatusData(parsedValue) ? parsedValue : undefined;
  } catch {
    return;
  }
};

const persistUserStatus = (sessionKey: string, value: UserStatusData) => {
  if (!isKeycloakEnabled() || sessionKey === ANONYMOUS_SESSION_KEY) {
    return;
  }

  setSessionStorageValue(
    `${USER_STATUS_STORAGE_KEY}:${sessionKey}`,
    JSON.stringify(value),
  );
};

const requestMainInfo = async () => {
  const response = await apiRequest<MainInfoResponse>(
    "get",
    "/permissions",
    undefined,
    { accessErrorPageType: "approvalPending", skipScreenId: true },
  );

  return response.data.data;
};

const requestReconsentRequiredExists = async () => {
  const response = await apiRequest<ReconsentRequiredExistsResponse>(
    "post",
    "/home/main/terms/reconsent-required/exists",
    undefined,
    { accessErrorPageType: "approvalPending" },
  );

  return response.data.data;
};

const requestUserStatus = async () => {
  const response = await apiRequest<UserStatusResponse>(
    "get",
    "/v1/backoffice/home/main/user-status",
    undefined,
    { accessErrorPageType: "approvalPending" },
  );

  return response.data.data;
};

export const getReconsentRequiredExistsApi = () => {
  const sessionKey = getSessionKey();

  return getSessionRequest({
    requests: reconsentRequests,
    sessionKey,
    persistedValue: getPersistedReconsentResult(sessionKey),
    request: requestReconsentRequiredExists,
    persist: (result) => persistReconsentResult(sessionKey, result),
  });
};

export const getUserStatusApi = () => {
  const sessionKey = getSessionKey();

  return getSessionRequest({
    requests: userStatusRequests,
    sessionKey,
    persistedValue: getPersistedUserStatus(sessionKey),
    request: requestUserStatus,
    persist: (result) => persistUserStatus(sessionKey, result),
  });
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
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401 || status === 403) {
        throw error;
      }

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
      queryKey: reconsentQueryKey(sessionKey),
      queryFn: getReconsentRequiredExistsApi,
      enabled: isSessionQueryEnabled,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }),
  userStatus: (sessionKey: string) =>
    queryOptions({
      queryKey: userStatusQueryKey(sessionKey),
      queryFn: getUserStatusApi,
      enabled: isSessionQueryEnabled,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }),
};

export const useGetReconsentRequiredExistsApiQuery = () => {
  const sessionKey = getSessionKey();

  return useQuery(mainInfoQueryFactory.reconsentRequiredExists(sessionKey));
};

export const useGetUserStatusApiQuery = () => {
  const sessionKey = getSessionKey();

  return useQuery(mainInfoQueryFactory.userStatus(sessionKey));
};

export const useGetMainInfoQuery = () => {
  return useQuery(mainInfoQueryFactory.current());
};
