import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useMainInfo } from "@/entities/user";
import { ACCESS_PAGE_PATHS } from "@/shared/lib/access-page";
import {
  API_ERROR_PAGE_PATHS,
  classifyApiError,
  useApiErrorPageStore,
} from "@/shared/lib/api-error";

import { DynamicMenuRoute } from "./DynamicMenuRoute";

export const AppRouter = () => {
  const location = useLocation();
  const {
    hasReconsentRequiredTerms,
    isMainInfoInitialized,
    mainInfoError,
    userInfo,
  } = useMainInfo();
  const apiErrorPageType = useApiErrorPageStore((state) => state.pageType);
  const mainInfoErrorPageType = mainInfoError
    ? classifyApiError(mainInfoError, "approvalPending")
    : null;
  const resolvedApiErrorPageType = apiErrorPageType ?? mainInfoErrorPageType;
  const apiErrorPath = resolvedApiErrorPageType
    ? API_ERROR_PAGE_PATHS[resolvedApiErrorPageType]
    : null;

  if (apiErrorPath && location.pathname !== apiErrorPath) {
    return <Navigate replace to={apiErrorPath} />;
  }

  if (
    isMainInfoInitialized &&
    hasReconsentRequiredTerms &&
    import.meta.env.MODE !== "bo" &&
    location.pathname !== ACCESS_PAGE_PATHS.termsReconsent
  ) {
    return <Navigate replace to={ACCESS_PAGE_PATHS.termsReconsent} />;
  }

  if (
    isMainInfoInitialized &&
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
