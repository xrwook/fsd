import type { ErrorInfo, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, useLocation } from "react-router-dom";

import TemporaryErrorPage from "@/pages/temporaryErrorPage";
import { API_ERROR_PAGE_PATHS } from "@/shared/lib/api-error";

const RouteErrorFallback = () => {
  const location = useLocation();

  if (location.pathname !== API_ERROR_PAGE_PATHS.temporary) {
    return <Navigate replace to={API_ERROR_PAGE_PATHS.temporary} />;
  }

  return <TemporaryErrorPage />;
};

type Props = {
  children: ReactNode;
};

const handleRouteError = (error: unknown, errorInfo: ErrorInfo) => {
  console.error("[RouteErrorBoundary]", error, errorInfo);
};

export const RouteErrorBoundary = ({ children }: Props) => {
  const location = useLocation();

  return (
    <ErrorBoundary
      fallbackRender={() => <RouteErrorFallback />}
      onError={handleRouteError}
      resetKeys={[location.pathname]}
    >
      {children}
    </ErrorBoundary>
  );
};
