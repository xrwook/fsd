// @vitest-environment jsdom
import type { InternalAxiosRequestConfig } from "axios";
import { AxiosError, CanceledError, isCancel } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { classifyApiError } from "@/shared/lib/api-error";

const { settings, adapter } = vi.hoisted(() => ({
  settings: {
    enabled: true,
    url: "https://sso.example.test",
    realm: "test",
    clientId: "test",
    onLoad: "login-required",
    tokenMinValiditySeconds: 30,
  },
  adapter: {
    authenticated: true,
    token: "test-access-token",
    init: vi.fn(),
    updateToken: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock("@/shared/config", () => ({
  env: { keycloak: settings },
  IS_MOCK_MODE: false,
}));
vi.mock("keycloak-js", () => ({
  default: vi.fn(function () {
    return adapter;
  }),
}));

const setup = async () => {
  const keycloak = await import("@/shared/lib/keycloak");
  const { defaultAxios } = await import("./axiosInstance");
  const transport = vi.fn(async (config: InternalAxiosRequestConfig) => ({
    config,
    data: {},
    status: 200,
    statusText: "OK",
    headers: {},
  }));
  defaultAxios.defaults.adapter = transport;
  return { keycloak, client: defaultAxios, transport };
};

const httpError = (status: number) => {
  const error = new AxiosError(`HTTP ${status}`);
  error.response = { status } as NonNullable<AxiosError["response"]>;
  return error;
};

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  settings.enabled = true;
  adapter.authenticated = true;
  adapter.token = "test-access-token";
  adapter.init.mockResolvedValue(true);
  adapter.updateToken.mockResolvedValue(false);
  adapter.login.mockImplementation(async () => {});
});

describe("Keycloak 세션 만료와 API 오류 처리", () => {
  it("정상 요청에는 토큰을 넣고 로그인하지 않는다", async () => {
    const { client, transport } = await setup();
    await client.get("/main-info");
    expect(transport.mock.calls[0][0].headers.get("Authorization")).toBe(
      "Bearer test-access-token",
    );
    expect(adapter.login).not.toHaveBeenCalled();
  });

  it("갱신 실패 시 서버 요청을 중단하고 오류 페이지 대신 로그인한다", async () => {
    adapter.updateToken.mockRejectedValue(new Error("Refresh token expired"));
    const { client, transport } = await setup();
    const error = await client.get("/main-info").catch((error: unknown) => error);
    expect(isCancel(error)).toBe(true);
    expect(classifyApiError(error)).toBeNull();
    expect(adapter.login).toHaveBeenCalledOnce();
    expect(transport).not.toHaveBeenCalled();
  });

  it("인증이 해제됐으면 토큰 없는 요청을 보내지 않고 로그인한다", async () => {
    adapter.authenticated = false;
    const { client, transport } = await setup();
    await expect(client.get("/main-info")).rejects.toSatisfy(isCancel);
    expect(adapter.login).toHaveBeenCalledOnce();
    expect(transport).not.toHaveBeenCalled();
  });

  it("세션이 만료돼 동시에 받은 401은 한 번만 로그인한다", async () => {
    const { client, transport } = await setup();
    adapter.updateToken.mockImplementation(async (minValidity: number) => {
      if (minValidity === -1) throw new Error("Refresh token expired");
      return false;
    });
    transport.mockRejectedValue(httpError(401));
    const results = await Promise.allSettled([
      client.get("/main-info"),
      client.get("/menu"),
    ]);
    expect(adapter.login).toHaveBeenCalledOnce();
    expect(transport).toHaveBeenCalledTimes(2);
    for (const result of results) {
      expect(result.status).toBe("rejected");
      if (result.status === "rejected") {
        expect(isCancel(result.reason)).toBe(true);
        expect(classifyApiError(result.reason, "approvalPending")).toBeNull();
      }
    }
  });

  it("권한 미부여 계정의 401은 로그인하지 않고 승인 대기로 분류한다", async () => {
    const { keycloak, client, transport } = await setup();
    const original = httpError(401);
    transport.mockRejectedValue(original);
    const error = await client.get("/main-info").catch((error: unknown) => error);

    expect(adapter.updateToken).toHaveBeenCalledWith(-1);
    expect(error).toBe(original);
    expect(isCancel(error)).toBe(false);
    expect(classifyApiError(error, "approvalPending")).toBe("approvalPending");
    expect(adapter.login).not.toHaveBeenCalled();
    expect(keycloak.isKeycloakRedirecting()).toBe(false);
    expect(transport).toHaveBeenCalledOnce();
  });

  it("동시 권한 오류는 세션 확인을 공유하고 원래 401을 유지한다", async () => {
    const { client, transport } = await setup();
    const original = httpError(401);
    transport.mockRejectedValue(original);
    const results = await Promise.allSettled([
      client.get("/main-info"),
      client.get("/menu"),
    ]);

    expect(
      adapter.updateToken.mock.calls.filter(([value]) => value === -1),
    ).toHaveLength(1);
    expect(results).toEqual([
      { status: "rejected", reason: original },
      { status: "rejected", reason: original },
    ]);
    expect(adapter.login).not.toHaveBeenCalled();
    expect(transport).toHaveBeenCalledTimes(2);
  });

  it("401 응답 전에 인증이 해제되면 로그인으로 복구한다", async () => {
    const { client, transport } = await setup();
    transport.mockImplementation(async () => {
      adapter.authenticated = false;
      throw httpError(401);
    });
    await expect(client.get("/main-info")).rejects.toSatisfy(isCancel);
    expect(adapter.login).toHaveBeenCalledOnce();
  });

  it.each([
    [403, "accessDenied"],
    [500, "temporary"],
  ])("HTTP %s는 기존 오류 처리를 유지한다", async (status, pageType) => {
    const { client, transport } = await setup();
    const original = httpError(Number(status));
    transport.mockRejectedValue(original);
    const error = await client.get("/main-info").catch((error: unknown) => error);
    expect(error).toBe(original);
    expect(classifyApiError(error)).toBe(pageType);
    expect(adapter.login).not.toHaveBeenCalled();
  });

  it("일반 API 네트워크 오류는 로그인으로 돌리지 않는다", async () => {
    const { client, transport } = await setup();
    transport.mockRejectedValue(new AxiosError("Network Error"));
    const error = await client.get("/main-info").catch((error: unknown) => error);
    expect(classifyApiError(error)).toBe("network");
    expect(adapter.login).not.toHaveBeenCalled();
  });

  it("Keycloak 비활성화 상태의 401은 기존 분류를 유지한다", async () => {
    settings.enabled = false;
    const { client, transport } = await setup();
    transport.mockRejectedValue(httpError(401));
    const error = await client.get("/main-info").catch((error: unknown) => error);
    expect(classifyApiError(error)).toBe("accessDenied");
    expect(adapter.login).not.toHaveBeenCalled();
  });

  it("SDK가 이미 자동 로그인을 시작했으면 중복 호출하지 않는다", async () => {
    const { keycloak, client, transport } = await setup();
    adapter.updateToken.mockImplementation(async () => {
      // login-required의 clearToken → onAuthLogout → SDK login 순서를 재현합니다.
      keycloak.markKeycloakRedirecting();
      await adapter.login();
      throw new Error("Refresh token expired");
    });
    await expect(client.get("/main-info")).rejects.toSatisfy(isCancel);
    expect(adapter.login).toHaveBeenCalledOnce();
    expect(transport).not.toHaveBeenCalled();
  });

  it("로그인 이동 중에는 추가 요청을 보내지 않는다", async () => {
    const { keycloak, client, transport } = await setup();
    keycloak.markKeycloakRedirecting();
    await expect(client.get("/main-info")).rejects.toSatisfy(isCancel);
    expect(adapter.updateToken).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });

  it("로그인 시작 실패를 취소로 숨기지 않고 다음 로그인 시도를 허용한다", async () => {
    const { keycloak, client, transport } = await setup();
    adapter.updateToken.mockImplementation(async (minValidity: number) => {
      if (minValidity === -1) throw new Error("Refresh token expired");
      return false;
    });
    const failure = new Error("Login navigation failed");
    adapter.login.mockRejectedValueOnce(failure);
    transport.mockRejectedValue(httpError(401));
    await expect(client.get("/main-info")).rejects.toBe(failure);
    expect(keycloak.isKeycloakRedirecting()).toBe(false);
    await keycloak.loginKeycloak();
    expect(adapter.login).toHaveBeenCalledTimes(2);
  });

  it("동시 로그인 호출 모두 같은 로그인 실패를 전달받는다", async () => {
    const { keycloak } = await setup();
    const failure = new Error("Login failed");
    adapter.login.mockRejectedValue(failure);
    const results = await Promise.allSettled([
      keycloak.loginKeycloak(),
      keycloak.loginKeycloak(),
    ]);
    expect(results).toEqual([
      { status: "rejected", reason: failure },
      { status: "rejected", reason: failure },
    ]);
    expect(adapter.login).toHaveBeenCalledOnce();
  });

  it("초기화 오류를 삼키지 않는다", async () => {
    const { keycloak } = await setup();
    const failure = new Error("Init failed");
    adapter.init.mockRejectedValue(failure);
    await expect(keycloak.initializeKeycloak()).rejects.toBe(failure);
  });

  it("일반 요청 취소도 네트워크 오류로 분류하지 않는다", () => {
    expect(classifyApiError(new CanceledError("Aborted"))).toBeNull();
  });
});
