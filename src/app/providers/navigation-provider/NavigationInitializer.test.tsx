// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { StrictMode } from "react";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMainInfo } from "@/entities/user";
import {
  clearNavigation,
  clearScreenRouteResolver,
  goBack,
  goForward,
  navigateToScreen,
  replaceToScreen,
} from "@/shared/lib/navigation";

import { NavigationInitializer } from "./NavigationInitializer";

vi.mock("@/entities/user", () => ({ useMainInfo: vi.fn() }));
vi.mock("@/app/router/extra-page-routes", () => ({ extraPageRoutes: [] }));

const renderLocation = vi.fn();
const LocationProbe = () => {
  const location = useLocation();
  renderLocation(location.pathname + location.search);
  return null;
};

const mountRouter = (initialEntries = ["/members?page=1"]) => {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <NavigationInitializer>
            <LocationProbe />
          </NavigationInitializer>
        ),
      },
    ],
    { initialEntries },
  );
  render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
  return router;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMainInfo).mockReturnValue({
    isMainInfoInitialized: true,
    menuPermissions: [
      { screenId: "emsp-member-info", url: "/members" },
      { screenId: "emsp-member-info-detail", url: "/members/:id" },
    ],
  } as ReturnType<typeof useMainInfo>);
});

afterEach(() => {
  cleanup();
  clearNavigation();
  clearScreenRouteResolver();
});

describe("navigation query restoration", () => {
  it("버튼과 뒤로가기 모두 마지막 쿼리를 사용하고 과거 값으로 화면을 렌더링하지 않는다", async () => {
    const router = mountRouter();
    await act(() => router.navigate("/other"));
    await act(() =>
      navigateToScreen("emsp-member-info", { queryParams: { page: 2 } }),
    );
    expect(router.state.location.search).toBe("?page=2");

    await act(() => goBack());
    expect(router.state.location.pathname).toBe("/other");
    renderLocation.mockClear();
    await act(() => goBack());
    expect(router.state.location.search).toBe("?page=2");
    expect(renderLocation).not.toHaveBeenCalledWith("/members?page=1");

    await act(() => goForward());
    expect(router.state.location.pathname).toBe("/other");
    await act(() => goForward());
    expect(router.state.location.search).toBe("?page=2");
  });

  it("직접 URL 쿼리 변경도 기억하여 screenId 이동과 POP에 반영한다", async () => {
    const router = mountRouter();
    await act(() => router.navigate("/members?page=3"));
    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("?page=3");
    await act(() => router.navigate("/other"));
    await act(() => navigateToScreen("emsp-member-info"));
    expect(router.state.location.search).toBe("?page=3");
  });

  it("쿼리를 명시적으로 삭제한 뒤 뒤로가도 이전 쿼리를 되살리지 않는다", async () => {
    const router = mountRouter();
    await act(() =>
      navigateToScreen("emsp-member-info", { queryParams: { page: null } }),
    );
    expect(router.state.location.search).toBe("");
    await act(() => goBack());
    expect(router.state.location.search).toBe("");
    await act(() => router.navigate("/other"));
    await act(() => navigateToScreen("emsp-member-info"));
    expect(router.state.location.search).toBe("");
  });

  it("서로 다른 상세 ID의 쿼리가 섞이지 않는다", async () => {
    const router = mountRouter();
    await act(() =>
      navigateToScreen("emsp-member-info-detail", {
        pathParams: { id: "1" },
        queryParams: { tab: "history" },
      }),
    );
    await act(() =>
      navigateToScreen("emsp-member-info-detail", { pathParams: { id: "2" } }),
    );
    expect(router.state.location.search).toBe("");
    await act(() =>
      navigateToScreen("emsp-member-info-detail", { pathParams: { id: "1" } }),
    );
    expect(router.state.location.search).toBe("?tab=history");
  });

  it("처음 연 URL과 방문하지 않은 history entry의 쿼리는 그대로 사용한다", async () => {
    const router = mountRouter(["/members?page=7", "/other"]);
    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("?page=7");
    await act(() => router.navigate("/other"));
    await act(() => navigateToScreen("emsp-member-info"));
    expect(router.state.location.search).toBe("?page=7");
  });

  it("쿼리 복원 시 history entry의 hash와 state를 유지한다", async () => {
    const router = mountRouter();
    await act(() =>
      router.navigate("/members?page=2#summary", { state: { from: "list" } }),
    );
    await act(() =>
      replaceToScreen("emsp-member-info", { queryParams: { page: 4 } }),
    );
    await act(() =>
      router.navigate("/members?page=5#summary", { state: { from: "list" } }),
    );
    await act(() => router.navigate("/members?page=6"));
    await act(() => router.navigate(-1));
    expect(router.state.location).toMatchObject({
      search: "?page=6",
      hash: "#summary",
      state: { from: "list" },
    });
  });
});
