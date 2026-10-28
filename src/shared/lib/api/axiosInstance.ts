import axios from "axios";

import { IS_MOCK_MODE } from "@/shared/config";
import { getKeycloakAccessToken } from "@/shared/lib/keycloak";

import { SCREEN_ID_HEADER } from "./constants";
import { getRequestScreenId } from "./requestContext";

const apiBaseUrl =
  !import.meta.env.DEV &&
  import.meta.env.MODE !== "dev" &&
  import.meta.env.VITE_BUILD_TARGET === "internal"
    ? "/v1/backoffice"
    : import.meta.env.VITE_API_URL;

export const defaultAxios = axios.create({
  baseURL: IS_MOCK_MODE
    ? `${window.location.origin}/api`
    : apiBaseUrl,
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
    return Promise.reject(error);
  },
);

defaultAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

export default defaultAxios;
