// Provider gate에서 사용하는 인증 상태입니다.
export type KeycloakAuthStatus =
  | "disabled"
  | "initializing"
  | "authenticated"
  | "error";
