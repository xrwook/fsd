type KeycloakOnLoad = "login-required" | "check-sso";

export const env = {
  appName: "fsd-test",
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== "false",
  keycloak: {
    enabled: getKeycloakEnabled(),
    isConfigured: isKeycloakConfigured(),
    url: getOptionalEnv("VITE_KEYCLOAK_URL"),
    realm: getOptionalEnv("VITE_KEYCLOAK_REALM"),
    clientId: getOptionalEnv("VITE_KEYCLOAK_CLIENT_ID"),
    onLoad: getKeycloakOnLoad(),
    tokenMinValiditySeconds: getNumberEnv(
      "VITE_KEYCLOAK_TOKEN_MIN_VALIDITY_SECONDS",
      30,
    ),
  },
};

function getOptionalEnv(key: string) {
  const value = import.meta.env[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isKeycloakConfigured() {
  return Boolean(
    getOptionalEnv("VITE_KEYCLOAK_URL") &&
      getOptionalEnv("VITE_KEYCLOAK_REALM") &&
      getOptionalEnv("VITE_KEYCLOAK_CLIENT_ID"),
  );
}

function getKeycloakEnabled() {
  const explicitValue = getOptionalEnv("VITE_KEYCLOAK_ENABLED");

  if (explicitValue === "true") {
    return true;
  }

  if (explicitValue === "false") {
    return false;
  }

  return import.meta.env.VITE_USE_MOCK_API === "false" && isKeycloakConfigured();
}

function getKeycloakOnLoad(): KeycloakOnLoad {
  const value = getOptionalEnv("VITE_KEYCLOAK_ON_LOAD");

  return value === "check-sso" ? "check-sso" : "login-required";
}

function getNumberEnv(key: string, fallback: number) {
  const value = getOptionalEnv(key);

  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
