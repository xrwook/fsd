// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import type Keycloak from "keycloak-js";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/shared/config";
import {
  getKeycloakInstance,
  initializeKeycloak,
  loginKeycloak,
  markKeycloakRedirecting,
} from "@/shared/lib/keycloak";

import { KeycloakProvider } from "./index";

// 이벤트 처리만 검증하므로 MUI의 전환 애니메이션/DOM 의존성은 제외합니다.
vi.mock("@mui/material", () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Box: Container,
    Stack: Container,
    Typography: Container,
    CircularProgress: () => null,
  };
});

vi.mock("@/shared/config", () => ({
  env: { keycloak: { enabled: true, onLoad: "login-required" } },
}));
vi.mock("@/shared/lib/keycloak", () => ({
  getKeycloakInstance: vi.fn(),
  initializeKeycloak: vi.fn(),
  loginKeycloak: vi.fn(),
  markKeycloakRedirecting: vi.fn(),
  refreshKeycloakToken: vi.fn(),
}));

let adapter: Keycloak;
beforeEach(() => {
  vi.resetAllMocks();
  adapter = {} as Keycloak;
  vi.mocked(getKeycloakInstance).mockReturnValue(adapter);
  vi.mocked(initializeKeycloak).mockResolvedValue(true);
  vi.mocked(loginKeycloak).mockImplementation(async () => {});
});
afterEach(cleanup);

describe("세션 종료 이벤트의 로그인 복구", () => {
  it.each(["login-required", "check-sso"] as const)(
    "%s 모드에 맞게 로그인 이동을 처리한다",
    async (onLoad) => {
      env.keycloak.onLoad = onLoad;
      await act(async () => {
        render(<KeycloakProvider>인증된 화면</KeycloakProvider>);
      });
      expect(screen.queryByText("인증된 화면")).not.toBeNull();

      act(() => adapter.onAuthLogout?.());

      if (onLoad === "login-required") {
        expect(markKeycloakRedirecting).toHaveBeenCalledOnce();
        expect(loginKeycloak).not.toHaveBeenCalled();
      } else {
        expect(loginKeycloak).toHaveBeenCalledOnce();
        expect(markKeycloakRedirecting).not.toHaveBeenCalled();
      }
    },
  );
});
