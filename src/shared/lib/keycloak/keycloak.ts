import type { KeycloakConfig, KeycloakInitOptions } from "keycloak-js";
import Keycloak from "keycloak-js";

import { env } from "@/shared/config";

// Keycloak adapter는 앱 전체에서 하나만 유지해야 redirect/session 상태가 꼬이지 않습니다.
let keycloakInstance: Keycloak | null = null;
// React StrictMode나 provider 재마운트 상황에서도 init은 한 번만 수행합니다.
let initKeycloak: Promise<boolean> | null = null;

/**
 * env에 정의된 Keycloak 서버 접속 정보를 keycloak-js 설정 객체로 변환합니다.
 */
const getKeycloakConfig = (): KeycloakConfig => {
  const { clientId, realm, url } = env.keycloak;

  if (!url || !realm || !clientId) {
    throw new Error(
      "Keycloak is enabled, but VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, or VITE_KEYCLOAK_CLIENT_ID is missing.",
    );
  }

  return {
    url,
    realm,
    clientId,
  };
};

/**
 * Keycloak 초기화 옵션을 구성합니다.
 */
const getInitOptions = (): KeycloakInitOptions => {
  const options: KeycloakInitOptions = {
    onLoad: 'login-required',//env.keycloak.onLoad,
    // SPA public client 기준으로 authorization code + PKCE 흐름을 사용합니다.
    pkceMethod: "S256",
    // iframe 세션 체크는 브라우저 3rd-party cookie 정책에 취약해 토큰 refresh 중심으로 관리합니다.
    checkLoginIframe: false,
  };

  if (env.keycloak.onLoad === "check-sso" && typeof window !== "undefined") {
    // check-sso 모드에서 전체 페이지 redirect 없이 로그인 상태를 확인할 때 사용됩니다.
    options.silentCheckSsoRedirectUri = `${window.location.origin}/silent-check-sso.html`;
  }

  return options;
};

/**
 * 현재 환경에서 Keycloak 인증을 사용할지 여부를 반환합니다.
 */
export const isKeycloakEnabled = () => {
  return env.keycloak.enabled;
};

/**
 * 앱 전체에서 공유할 Keycloak adapter singleton을 반환합니다.
 */
export const getKeycloakInstance = () => {
  if (!isKeycloakEnabled()) {
    return null;
  }

  // 설정 검증은 실제 Keycloak이 활성화된 경우에만 수행합니다.
  keycloakInstance ??= new Keycloak(getKeycloakConfig());

  return keycloakInstance;
};

/**
 * Keycloak adapter를 초기화하고 인증 여부를 확인합니다.
 */
export const initializeKeycloak = () => {
  if (!isKeycloakEnabled()) {
    return Promise.resolve(false);
  }

  const keycloak = getKeycloakInstance();

  if (!keycloak) {
    return Promise.resolve(false);
  }

  initKeycloak ??= keycloak.init(getInitOptions());

  return initKeycloak;
};

/**
 * Keycloak 로그인 페이지로 이동합니다.
 */
export const loginKeycloak = async () => {
  await getKeycloakInstance()?.login();
};

/**
 * Keycloak 세션을 로그아웃 처리합니다.
 */
export const logoutKeycloak = async () => {
  await getKeycloakInstance()?.logout();
};

/**
 * 인증된 사용자의 access token을 필요 시 갱신합니다.
 */
export const refreshKeycloakToken = async () => {
  const keycloak = getKeycloakInstance();

  if (!keycloak?.authenticated) {
    return null;
  }

  // API 호출 직전에 만료 임박 토큰을 갱신해 Authorization 헤더에는 최신 토큰만 넣습니다.
  await keycloak.updateToken(env.keycloak.tokenMinValiditySeconds);

  return keycloak.token ?? null;
};

/**
 * API 요청에 사용할 최신 access token을 반환합니다.
 */
export const getKeycloakAccessToken = async () => {
  if (!isKeycloakEnabled()) {
    return null;
  }

  const keycloak = getKeycloakInstance();

  if (!keycloak?.authenticated) {
    return null;
  }

  try {
    return await refreshKeycloakToken();
  } catch (error) {
    // refresh 실패는 세션 만료로 보고 로컬 토큰을 비운 뒤 Keycloak 로그인으로 되돌립니다.
    keycloak.clearToken();
    keycloak.login().catch(() => {});
    throw error;
  }
};

