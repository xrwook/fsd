import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { env } from "@/shared/config";
import type { KeycloakAuthStatus } from "@/shared/lib/keycloak";
import {
  getKeycloakInstance,
  initializeKeycloak,
  loginKeycloak,
  refreshKeycloakToken,
} from "@/shared/lib/keycloak";

type Props = {
  children: ReactNode;
};

type KeycloakProviderState = {
  status: KeycloakAuthStatus;
  error: Error | null;
};

const isKeycloakEnabled = env.keycloak.enabled;

const getInitialState = (): KeycloakProviderState => {
  if (!isKeycloakEnabled) {
    return {
      status: "disabled",
      error: null,
    };
  }

  return {
    status: "initializing",
    error: null,
  };
};

const toError = (error: unknown) => {
  return error instanceof Error ? error : new Error(String(error));
};

// 앱 본문보다 먼저 Keycloak 인증 상태를 확정해 권한 API와 라우터가 토큰 없이 실행되지 않게 합니다.
export const KeycloakProvider = ({ children }: Props) => {
  const [state, setState] = useState<KeycloakProviderState>(getInitialState);

  useEffect(() => {
    if (!isKeycloakEnabled) {
      return;
    }

    let isMounted = true;
    let keycloak: ReturnType<typeof getKeycloakInstance>;

    try {
      keycloak = getKeycloakInstance();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        status: "error",
        error: toError(error),
      }));

      return;
    }

    const setAuthenticatedState = () => {
      if (!isMounted) {
        return;
      }

      setState({
        status: "authenticated",
        error: null,
      });
    };

    const setErrorState = (error: unknown) => {
      if (!isMounted) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        status: "error",
        error: toError(error),
      }));
    };

    const handleTokenRefreshError = (error: unknown) => {
      setErrorState(error);
      loginKeycloak().catch(() => {});
    };

    if (keycloak) {
      // Keycloak adapter 이벤트를 React state로 동기화합니다.
      keycloak.onAuthSuccess = () => {
        setAuthenticatedState();
      };
      keycloak.onAuthLogout = () => {
        loginKeycloak().catch(() => {});
      };
      keycloak.onAuthRefreshSuccess = () => {
        setState((currentState) => ({
          ...currentState,
          error: null,
        }));
      };
      keycloak.onAuthRefreshError = () => {
        setErrorState(new Error("Keycloak token refresh failed."));
        loginKeycloak().catch(() => {});
      };
      keycloak.onTokenExpired = () => {
        refreshKeycloakToken().catch(handleTokenRefreshError);
      };
    }

    initializeKeycloak()
      .then((isAuthenticated) => {
        if (isAuthenticated) {
          setAuthenticatedState();
          return;
        }

        loginKeycloak().catch(setErrorState);
      })
      .catch(setErrorState);

    return () => {
      isMounted = false;

      if (keycloak) {
        keycloak.onAuthSuccess = undefined;
        keycloak.onAuthLogout = undefined;
        keycloak.onAuthRefreshSuccess = undefined;
        keycloak.onAuthRefreshError = undefined;
        keycloak.onTokenExpired = undefined;
      }
    };
  }, []);

  return renderKeycloakGate(state, children);
};

const renderKeycloakGate = (
  state: KeycloakProviderState,
  children: ReactNode,
) => {
  // 로그인 필수 정책이므로 인증 완료된 경우에만 실제 앱을 렌더링합니다.
  if (!isKeycloakEnabled || state.status === "authenticated") {
    return children;
  }

  if (state.status === "error") {
    return (
      <AuthStateLayout>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          로그인 설정을 확인할 수 없습니다.
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          {state.error?.message}
        </Typography>
      </AuthStateLayout>
    );
  }

  return (
    <AuthStateLayout>
      <CircularProgress size={28} />
      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
        인증 정보를 확인하는 중입니다.
      </Typography>
    </AuthStateLayout>
  );
};

const AuthStateLayout = ({ children }: Props) => {
  return (
    <Box
      sx={{
        display: "grid",
        minHeight: "100vh",
        placeItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
        {children}
      </Stack>
    </Box>
  );
};
