import axios from "axios";

import { getKeycloakAccessToken } from "@/shared/lib/keycloak";

import { PAGE_ID_HEADER } from "./constants";
import { getRequestPageId } from "./requestContext";

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async (config) => {
  const pageId = getRequestPageId();
  console.log("axiosInstance.interceptors.request.use", { pageId });
  if (pageId && !config.headers.has(PAGE_ID_HEADER)) {
    config.headers.set(PAGE_ID_HEADER, pageId);
  }

  if (!config.headers.has("Authorization")) {
    const token = await getKeycloakAccessToken();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});
