import { getKeycloakAccessToken } from "../keycloak";

type RequestOptions = RequestInit & {
  // public API나 인증 전 요청은 auth: false로 토큰 주입을 끌 수 있습니다.
  auth?: boolean;
};

const createRequestHeaders = async (options: RequestOptions) => {
  const headers = new Headers(options.headers);

  if (options.auth !== false && !headers.has("Authorization")) {
    // Keycloak이 활성화되어 있으면 refresh까지 확인한 access token을 붙입니다.
    const token = await getKeycloakAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
};

const toFetchOptions = (options: RequestOptions): RequestInit => {
  if (!("auth" in options)) {
    return options;
  }

  const fetchOptions = { ...options };
  // auth는 fetch 표준 옵션이 아니므로 실제 fetch 호출 전 제거합니다.
  delete fetchOptions.auth;

  return fetchOptions;
};

const request = async <T>(url: string, options: RequestOptions = {}) => {
  const response = await fetch(url, {
    ...toFetchOptions(options),
    headers: await createRequestHeaders(options),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const axiosInstance = {
  get: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    return request<T>(url, {
      ...options,
      method: "GET",
    });
  },
};
