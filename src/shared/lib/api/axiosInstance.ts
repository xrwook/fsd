import axios, { CanceledError } from "axios";

import { IS_MOCK_MODE } from "@/shared/config";
import {
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
  (error: unknown) => {
    // 수정: 세션 만료 처리 - 인증 실패(401)는 로그인으로 복구하고, 권한 부족(403)은 유지합니다.
    if (
      isKeycloakEnabled() &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      return redirectToLoginAndCancel();
    }

    return Promise.reject(error);
  },
);

export default defaultAxios;
