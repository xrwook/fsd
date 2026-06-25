/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_ENABLED?: string;
  readonly VITE_KEYCLOAK_URL?: string;
  readonly VITE_KEYCLOAK_REALM?: string;
  readonly VITE_KEYCLOAK_CLIENT_ID?: string;
  readonly VITE_KEYCLOAK_ON_LOAD?: "login-required" | "check-sso";
  readonly VITE_KEYCLOAK_TOKEN_MIN_VALIDITY_SECONDS?: string;
}
