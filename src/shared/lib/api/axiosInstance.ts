import axios from "axios";

import { IS_MOCK_MODE } from "@/shared/config";
import { getKeycloakAccessToken } from "@/shared/lib/keycloak";

import { showApiErrorModal } from "./apiErrorModalStore";
import { SCREEN_ID_HEADER } from "./constants";
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from "./errorMessages";
import { getRequestScreenId } from "./requestContext";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNonEmptyString = (value: unknown) => {
  return typeof value === "string" && value.trim() ? value : undefined;
};

const toErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

const getErrorModalMessage = (error: unknown, code: string | undefined) => {
  if (!axios.isAxiosError(error)) {
    return toErrorMessage(error);
  }

  if (!error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  return getApiErrorMessage(code);
};

const showAxiosErrorModal = (error: unknown) => {
  const axiosError = axios.isAxiosError(error) ? error : undefined;
  const responseData = axiosError?.response?.data;
  const errorBody = isRecord(responseData) ? responseData : undefined;
  const code = toNonEmptyString(errorBody?.["code"]);

  showApiErrorModal({
    code,
    message: getErrorModalMessage(error, code),
    status: axiosError?.response?.status,
    title: "API 오류",
    trace: toNonEmptyString(errorBody?.["trace"]),
  });
};

export const defaultAxios = axios.create({
  baseURL: IS_MOCK_MODE
    ? `${window.location.origin}/api`
    : `${import.meta.env.VITE_API_URL}/api`,
});

defaultAxios.interceptors.request.use(
  async (config) => {
    const accessToken = await getKeycloakAccessToken();
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
    showAxiosErrorModal(error);

    return Promise.reject(error);
  },
);

defaultAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: unknown) => {
    showAxiosErrorModal(error);

    return Promise.reject(error);
  },
);

export default defaultAxios;
