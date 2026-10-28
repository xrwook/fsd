import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useMainInfo } from "@/entities/user";
import { ACCESS_PAGE_PATHS } from "@/shared/lib/access-page";
import {
  API_ERROR_PAGE_PATHS,
  classifyApiError,
  useApiErrorPageStore,
} from "@/shared/lib/api-error";
import { isKeycloakRedirecting } from "@/shared/lib/keycloak";

import { DynamicMenuRoute } from "./DynamicMenuRoute";

export const AppRouter = () => {
  const location = useLocation();
  const {
    hasReconsentRequiredTerms,
    isMainInfoInitialized,
    isReconsentRequiredInitialized,
    isUserStatusInitialized,
    mainInfoError,
    userInfo,
  } = useMainInfo();
  const apiErrorPageType = useApiErrorPageStore((state) => state.pageType);
  const mainInfoErrorPageType = mainInfoError
    ? classifyApiError(mainInfoError, "approvalPending")
    : null;
  const isSystemError =
    apiErrorPageType === "temporary" || apiErrorPageType === "network";
  const resolvedApiErrorPageType =
    mainInfoErrorPageType ??
    (isMainInfoInitialized || isSystemError ? apiErrorPageType : null);

  const apiErrorPath = (() => {
    if (isKeycloakRedirecting() || !resolvedApiErrorPageType) {
      return null;
    }

    return API_ERROR_PAGE_PATHS[resolvedApiErrorPageType];
  })();

  if (apiErrorPath && location.pathname !== apiErrorPath) {
    return (
      <Navigate
        replace
        to={apiErrorPath}
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  if (
    isMainInfoInitialized &&
    isReconsentRequiredInitialized &&
    hasReconsentRequiredTerms &&
    import.meta.env.MODE !== "bo" &&
    location.pathname !== ACCESS_PAGE_PATHS.termsReconsent
  ) {
    return <Navigate replace to={ACCESS_PAGE_PATHS.termsReconsent} />;
  }

  if (
    isMainInfoInitialized &&
    isUserStatusInitialized &&
    userInfo?.userStatus === "E" &&
    location.pathname !== ACCESS_PAGE_PATHS.approvalExtension
  ) {
    return <Navigate replace to={ACCESS_PAGE_PATHS.approvalExtension} />;
  }

  return (
    <Routes>
      {/* 나머지 모든 URL은 API 메뉴 url 기준으로 동적으로 해석합니다. */}
      <Route path="*" element={<DynamicMenuRoute />} />
    </Routes>
  );
};
