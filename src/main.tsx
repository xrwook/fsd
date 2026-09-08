import "@/app.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "@/app/App";
import { KeycloakProvider } from "@/app/providers/keycloak-provider";
import { ModalProvider } from "@/app/providers/modal-provider";
import { MuiProvider } from "@/app/providers/mui-provider";
import MultiProvider from "@/app/providers/MultiProvider";
import { QueryProvider } from "@/app/providers/query-provider";
import { RouteErrorBoundary } from "@/app/router/RouteErrorBoundary";
import ApprovalExtensionPage from "@/pages/access/approval-extension";
import TermsReconsentPage from "@/pages/access/terms-reconsent";
import AccessDeniedPage from "@/pages/accessDeniedPage";
import ApprovalPendingPage from "@/pages/approvalPending";
import NetworkErrorPage from "@/pages/networkErrorPage";
import TemporaryErrorPage from "@/pages/temporaryErrorPage";
import { ACCESS_PAGE_PATHS } from "@/shared/lib/access-page";
import { API_ERROR_PAGE_PATHS } from "@/shared/lib/api-error";
import { enableMocking } from "@/shared/mocks";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

await enableMocking();

const router = createBrowserRouter([
  {
    element: <ApprovalExtensionPage />,
    path: ACCESS_PAGE_PATHS.approvalExtension,
  },
  {
    element: <TermsReconsentPage />,
    path: ACCESS_PAGE_PATHS.termsReconsent,
  },
  {
    element: <AccessDeniedPage />,
    path: API_ERROR_PAGE_PATHS.accessDenied,
  },
  {
    element: <ApprovalPendingPage />,
    path: API_ERROR_PAGE_PATHS.approvalPending,
  },
  {
    element: <NetworkErrorPage />,
    path: API_ERROR_PAGE_PATHS.network,
  },
  {
    element: <TemporaryErrorPage />,
    path: API_ERROR_PAGE_PATHS.temporary,
  },
  {
    element: (
      <RouteErrorBoundary>
        <App />
      </RouteErrorBoundary>
    ),
    path: "/*",
  },
]);

createRoot(rootElement).render(
  <StrictMode>
    <MultiProvider
      providers={[
        <QueryProvider key="QueryProvider" />,
        <MuiProvider key="MuiProvider" />,
        <KeycloakProvider key="KeycloakProvider" />,
        <ModalProvider key="ModalProvider" />,
      ]}
    >
      <RouterProvider router={router} />
    </MultiProvider>
  </StrictMode>,
);
