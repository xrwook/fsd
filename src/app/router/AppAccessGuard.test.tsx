// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { AxiosError } from "axios";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMainInfo } from "@/entities/user";
import { useApiErrorPageStore } from "@/shared/lib/api-error";
import { isKeycloakRedirecting } from "@/shared/lib/keycloak";

import { AppAccessGuard } from "./AppAccessGuard";

vi.mock("@/entities/user", () => ({ useMainInfo: vi.fn() }));
vi.mock("@/shared/lib/keycloak", () => ({
  isKeycloakRedirecting: vi.fn(() => false),
}));

const layoutRender = vi.fn();
const MainLayout = () => {
  layoutRender();
  return <div>메인 레이아웃</div>;
};
const ErrorPage = () => {
  const location = useLocation();
  return <div>{location.pathname}</div>;
};
const TestApp = () => (
  <MemoryRouter initialEntries={["/home?tab=1#summary"]}>
    <Routes>
      <Route
        path="/home"
        element={
          <AppAccessGuard>
            <MainLayout />
          </AppAccessGuard>
        }
      />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  </MemoryRouter>
);

const setMainInfo = (
  overrides: Partial<ReturnType<typeof useMainInfo>> = {},
) => {
  vi.mocked(useMainInfo).mockReturnValue({
    hasReconsentRequiredTerms: false,
    isMainInfoInitialized: true,
    isReconsentRequiredInitialized: true,
    isUserStatusInitialized: true,
    mainInfoError: null,
    userInfo: null,
    ...overrides,
  } as ReturnType<typeof useMainInfo>);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isKeycloakRedirecting).mockReturnValue(false);
  useApiErrorPageStore.getState().clearApiErrorPage();
  setMainInfo();
});
afterEach(cleanup);

describe("AppAccessGuard", () => {
  it.each([
    "isMainInfoInitialized",
    "isReconsentRequiredInitialized",
    "isUserStatusInitialized",
  ] as const)("%s 조회 중에는 레이아웃을 마운트하지 않는다", (field) => {
    setMainInfo({ [field]: false });
    const { rerender } = render(<TestApp />);
    expect(layoutRender).not.toHaveBeenCalled();

    setMainInfo();
    rerender(<TestApp />);
    expect(screen.queryByText("메인 레이아웃")).not.toBeNull();
  });

  it("다른 조회가 진행 중이어도 승인 대기로 이동하며 레이아웃을 마운트하지 않는다", async () => {
    setMainInfo({
      isMainInfoInitialized: false,
      isReconsentRequiredInitialized: false,
      isUserStatusInitialized: false,
    });
    const { rerender } = render(<TestApp />);
    useApiErrorPageStore.setState({ pageType: "approvalPending" });
    rerender(<TestApp />);

    expect(await screen.findByText("/approvalPending")).not.toBeNull();
    expect(layoutRender).not.toHaveBeenCalled();
  });

  it("권한 조회 오류가 승인 대기이면 레이아웃을 거치지 않는다", async () => {
    const error = new AxiosError("Forbidden");
    error.response = { status: 403 } as NonNullable<AxiosError["response"]>;
    setMainInfo({ mainInfoError: error });
    render(<TestApp />);

    expect(await screen.findByText("/approvalPending")).not.toBeNull();
    expect(layoutRender).not.toHaveBeenCalled();
  });

  it.each(["network", "temporary", "accessDenied"] as const)(
    "%s 오류는 기존 오류 페이지로 이동한다",
    async (pageType) => {
      const paths = {
        network: "/network-error",
        temporary: "/temporary-error",
        accessDenied: "/access-denied",
      };
      useApiErrorPageStore.setState({ pageType });
      render(<TestApp />);

      expect(await screen.findByText(paths[pageType])).not.toBeNull();
      expect(layoutRender).not.toHaveBeenCalled();
    },
  );

  it("인증 페이지로 이동 중에는 레이아웃을 마운트하지 않는다", () => {
    vi.mocked(isKeycloakRedirecting).mockReturnValue(true);
    render(<TestApp />);
    expect(layoutRender).not.toHaveBeenCalled();
  });
});
