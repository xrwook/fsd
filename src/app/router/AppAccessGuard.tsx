import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useMainInfo } from "@/entities/user";
import { ACCESS_PAGE_PATHS } from "@/shared/lib/access-page";
import {
  API_ERROR_PAGE_PATHS,
  classifyApiError,
  useApiErrorPageStore,
} from "@/shared/lib/api-error";
import { isKeycloakRedirecting } from "@/shared/lib/keycloak";

export const AppAccessGuard = ({ children }: PropsWithChildren) => {
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
  const initializedApiErrorPageType =
    isMainInfoInitialized || isSystemError ? apiErrorPageType : null;
  const resolvedApiErrorPageType =
    apiErrorPageType === "approvalPending"
      ? apiErrorPageType
      : (mainInfoErrorPageType ?? initializedApiErrorPageType);

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

  // 승인 확인이 끝나기 전에는 상단바·사이드바·본문을 마운트하지 않습니다.
  // isFetched 기준이므로 주기적인 백그라운드 재조회 때는 화면을 유지합니다.
  if (
    isKeycloakRedirecting() ||
    !isMainInfoInitialized ||
    !isReconsentRequiredInitialized ||
    !isUserStatusInitialized
  ) {
    return null;
  }

  if (
    hasReconsentRequiredTerms &&
    import.meta.env.MODE !== "bo" &&
    location.pathname !== ACCESS_PAGE_PATHS.termsReconsent
  ) {
    return <Navigate replace to={ACCESS_PAGE_PATHS.termsReconsent} />;
  }

  if (
    userInfo?.userStatus === "E" &&
    location.pathname !== ACCESS_PAGE_PATHS.approvalExtension
  ) {
    return <Navigate replace to={ACCESS_PAGE_PATHS.approvalExtension} />;
  }

  return children;
};
