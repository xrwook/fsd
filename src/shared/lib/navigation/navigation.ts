import type {
  NavigateFunction,
  NavigateOptions,
  To,
} from "react-router-dom";

import type { ScreenIdValues } from "@/shared/config";

export type ExternalNavigationTarget = "_self" | "_blank";
export type ScreenRoutePathParams = Record<string, string | number>;
export type ScreenRouteResolver = (
  screenId: ScreenIdValues,
  pathParams?: ScreenRoutePathParams,
) => To | null;
export type ScreenNavigateOptions = NavigateOptions & {
  pathParams?: ScreenRoutePathParams;
};

const EXTERNAL_URL_PROTOCOL_PATTERN = /^(https?:\/\/|mailto:|tel:)/i;
const PROTOCOL_RELATIVE_URL_PATTERN = /^\/\//;

let navigateFunction: NavigateFunction | null = null;
let screenRouteResolver: ScreenRouteResolver | null = null;

/** navigation service 내부 오류를 앱 런타임을 중단하지 않는 방식으로 알립니다. */
const reportNavigationError = (message: string) => {
  console.error(`[navigation] ${message}`);
};

/** NavigationInitializer에서 주입한 React Router navigate 함수를 반환합니다. */
const getNavigationInit = () => {
  if (navigateFunction) {
    return navigateFunction;
  }

  reportNavigationError(
    "Navigation service is not initialized. Render NavigationInitializer inside Router before using navigation functions.",
  );

  return null;
};

/** app 레이어에서 주입한 screenId 기반 route resolver를 반환합니다. */
const getScreenRouteResolver = () => {
  if (screenRouteResolver) {
    return screenRouteResolver;
  }

  reportNavigationError(
    "Screen route resolver is not initialized. Render NavigationInitializer after menu information is loaded before using screen navigation functions.",
  );

  return null;
};

/** React Router To 타입에서 외부 URL 판별에 사용할 문자열 경로만 추출합니다. */
const getStringPath = (to: To) => {
  return typeof to === "string" ? to : to.pathname;
};

/** SPA 라우팅 함수에 외부 URL이 잘못 전달되는 것을 방지합니다. */
const guardInternalTo = (to: To) => {
  const path = getStringPath(to);

  if (!path || !isExternalUrl(path)) {
    return true;
  }

  reportNavigationError(
    `외부 URL "${path}"이(가) 라우터 내비게이션에 전달되었습니다. 대신 openExternalUrl을 사용하세요.`,
  );

  return false;
};

/** screen 이동 옵션에서 React Router navigate에 전달하지 않을 pathParams만 제거합니다. */
const getNavigateOptions = (options?: ScreenNavigateOptions) => {
  if (!options) {
    return;
  }

  const navigateOptions = { ...options };
  delete navigateOptions.pathParams;

  return navigateOptions;
};

/** app 레이어의 NavigationInitializer가 React Router navigate 함수를 주입할 때 사용합니다. */
export const initNavigation = (navigate: NavigateFunction) => {
  navigateFunction = navigate;
};

/** app 레이어의 NavigationInitializer가 API 메뉴 기반 screenId route resolver를 주입할 때 사용합니다. */
export const initScreenRouteResolver = (
  resolver: ScreenRouteResolver,
) => {
  screenRouteResolver = resolver;
};

/** 테스트 또는 Router unmount 시 저장된 navigate 함수를 해제합니다. */
export const clearNavigation = (navigate?: NavigateFunction) => {
  if (!navigate || navigateFunction === navigate) {
    navigateFunction = null;
  }
};

/** 테스트 또는 메뉴 정보 unmount 시 저장된 screenId route resolver를 해제합니다. */
export const clearScreenRouteResolver = (resolver?: ScreenRouteResolver) => {
  if (!resolver || screenRouteResolver === resolver) {
    screenRouteResolver = null;
  }
};

/** http, https, mailto, tel, protocol-relative URL을 외부 URL로 판별합니다. */
export const isExternalUrl = (url: string) => {
  const normalizedUrl = url.trim();

  return (
    EXTERNAL_URL_PROTOCOL_PATTERN.test(normalizedUrl) ||
    PROTOCOL_RELATIVE_URL_PATTERN.test(normalizedUrl)
  );
};

/** 내부 React Router 경로로 SPA 페이지 이동을 수행합니다. */
export const navigateTo = (to: To, options?: NavigateOptions) => {
  const navigate = getNavigationInit();

  if (!navigate || !guardInternalTo(to)) {
    return;
  }

  navigate(to, options);
};

/** API 메뉴에서 받은 screenId를 현재 앱 URL로 해석합니다. */
const screenPath = (
  screenId: ScreenIdValues,
  pathParams?: ScreenRoutePathParams,
) => {
  const resolver = getScreenRouteResolver();

  if (!resolver) {
    return null;
  }

  const path = resolver(screenId, pathParams);

  if (!path) {
    return null;
  }

  return path;
};

/** API 메뉴에서 받은 screenId 기준으로 SPA 페이지 이동을 수행합니다. */
export const navigateToScreen = (
  screenId: ScreenIdValues,
  options?: ScreenNavigateOptions,
) => {
  const path = screenPath(screenId, options?.pathParams);

  if (!path) {
    return;
  }

  navigateTo(path, getNavigateOptions(options));
};

/** 내부 React Router 경로로 현재 history entry를 대체하며 이동합니다. */
export const replaceTo = (to: To, options?: NavigateOptions) => {
  const navigate = getNavigationInit();

  if (!navigate || !guardInternalTo(to)) {
    return;
  }

  navigate(to, {
    ...options,
    replace: true,
  });
};

/** API 메뉴에서 받은 screenId 기준으로 현재 history entry를 대체하며 이동합니다. */
export const replaceToScreen = (
  screenId: ScreenIdValues,
  options?: ScreenNavigateOptions,
) => {
  const path = screenPath(screenId, options?.pathParams);

  if (!path) {
    return;
  }

  replaceTo(path, getNavigateOptions(options));
};

/** 브라우저 history의 이전 entry로 이동합니다. */
export const goBack = () => {
  const navigate = getNavigationInit();

  if (!navigate) {
    return;
  }

  navigate(-1);
};

/** 브라우저 history의 다음 entry로 이동합니다. */
export const goForward = () => {
  const navigate = getNavigationInit();

  if (!navigate) {
    return;
  }

  navigate(1);
};

/** 외부 URL을 현재 창 또는 새 탭에서 엽니다. 내부 경로 이동에는 navigateTo/replaceTo를 사용해야 합니다. */
export const openExternalUrl = (
  url: string,
  target: ExternalNavigationTarget = "_self",
) => {
  if (typeof window === "undefined") {
    reportNavigationError(
      `External URL "${url}" cannot be opened outside a browser environment.`,
    );

    return;
  }

  if (!isExternalUrl(url)) {
    reportNavigationError(
      `Internal path "${url}" was passed to external navigation. Use navigateTo or replaceTo instead.`,
    );

    return;
  }

  if (target === "_blank") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(url);
};
