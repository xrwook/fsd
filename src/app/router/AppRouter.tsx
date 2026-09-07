import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useMainInfo } from "@/entities/user";
import AccessDeniedPage from "@/pages/accessDeniedPage";
import ApprovalPendingPage from "@/pages/approvalPending";
import NetworkErrorPage from "@/pages/networkErrorPage";
import TemporaryErrorPage from "@/pages/temporaryErrorPage";
import {
  API_ERROR_PAGE_PATHS,
  classifyApiError,
  useApiErrorPageStore,
} from "@/shared/lib/api-error";

import { DynamicMenuRoute } from "./DynamicMenuRoute";

export const AppRouter = () => {
  const location = useLocation();
  const { mainInfoError } = useMainInfo();
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

  return (
    <Routes>
      <Route
        element={<AccessDeniedPage />}
        path={API_ERROR_PAGE_PATHS.accessDenied}
      />
      <Route
        element={<ApprovalPendingPage />}
        path={API_ERROR_PAGE_PATHS.approvalPending}
      />
      <Route
        element={<NetworkErrorPage />}
        path={API_ERROR_PAGE_PATHS.network}
      />
      <Route
        element={<TemporaryErrorPage />}
        path={API_ERROR_PAGE_PATHS.temporary}
      />
      {/* 나머지 모든 URL은 API 메뉴 url 기준으로 동적으로 해석합니다. */}
      <Route path="*" element={<DynamicMenuRoute />} />
    </Routes>
  );
};
