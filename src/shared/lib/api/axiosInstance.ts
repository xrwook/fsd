import axios, { CanceledError } from "axios";

import { IS_MOCK_MODE } from "@/shared/config";
import {
  forceRefreshKeycloakToken,
  getKeycloakAccessToken,
  isKeycloakEnabled,
  isKeycloakRedirecting,
  loginKeycloak,
} from "@/shared/lib/keycloak";

import { SCREEN_ID_HEADER } from "./constants";
import { getRequestScreenId } from "./requestContext";

const apiBaseUrl =
  !import.meta.env.DEV &&
  import.meta.env.MODE !== "dev" &&
  import.meta.env.VITE_BUILD_TARGET === "emsp"
    ? "/v1/backoffice"
    : import.meta.env.VITE_API_URL;

export const defaultAxios = axios.create({
  baseURL: IS_MOCK_MODE
    ? `${window.location.origin}/api`
    : apiBaseUrl,
});

// 수정: 세션 만료 처리 - 로그인 이동으로 중단한 API는 공통 오류 페이지 대상에서 제외합니다.
// 로그인 시작 자체가 실패하면 해당 오류를 그대로 전달해 장애를 숨기지 않습니다.
const redirectToLoginAndCancel = async (): Promise<never> => {
  await loginKeycloak();
  throw new CanceledError("Keycloak login redirect started.");
};

// 수정: 승인 대기 401 무한 로그인 방지 - 동시 401은 진행 중인 세션 확인을 공유합니다.
let sessionValidationRequest: Promise<string | null> | null = null;

const validateKeycloakSession = () => {
  sessionValidationRequest ??= forceRefreshKeycloakToken().finally(() => {
    sessionValidationRequest = null;
  });
  return sessionValidationRequest;
};

defaultAxios.interceptors.request.use(
  async (config) => {
    // 수정: 세션 만료 처리 - 이동 중이거나 토큰을 확보하지 못한 요청은 서버로 보내지 않습니다.
    if (isKeycloakRedirecting()) {
      throw new CanceledError("Keycloak redirect in progress.");
    }

    let accessToken: string | null;
    try {
      accessToken = await getKeycloakAccessToken();
    } catch (error) {
      if (!isKeycloakEnabled()) {
        throw error;
      }
      return redirectToLoginAndCancel();
    }

    if (isKeycloakEnabled() && !accessToken) {
      return redirectToLoginAndCancel();
    }

    // 토큰을 기다리는 동안 다른 요청이 로그인 이동을 시작했을 수도 있습니다.
    if (isKeycloakRedirecting()) {
      throw new CanceledError("Keycloak redirect in progress.");
    }

    const screenId = getRequestScreenId();

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (config.skipScreenId) {
      config.headers.delete(SCREEN_ID_HEADER);
    } else if (config.screenId) {
      config.headers.set(SCREEN_ID_HEADER, config.screenId);
    } else if (screenId && !config.headers.has(SCREEN_ID_HEADER)) {
      config.headers.set(SCREEN_ID_HEADER, screenId);
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

defaultAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: unknown) => {
    // 수정: 승인 대기 401 무한 로그인 방지 - 이 API는 권한 미부여에도 401을 반환합니다.
    // 강제 토큰 갱신이 성공하면 재로그인하지 않고 원래 오류를 공통 분류기에 전달합니다.
    if (
      isKeycloakEnabled() &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      if (isKeycloakRedirecting()) {
        return redirectToLoginAndCancel();
      }

      let accessToken: string | null;
      try {
        accessToken = await validateKeycloakSession();
      } catch {
        return redirectToLoginAndCancel();
      }

      if (!accessToken || isKeycloakRedirecting()) {
        return redirectToLoginAndCancel();
      }
      // main-info의 accessErrorPageType: "approvalPending"을 유지합니다.
      // 업무 API는 여기서 자동 재전송하지 않습니다.
    }

    throw error;
  },
);

export default defaultAxios;
