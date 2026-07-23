import "@/app.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { NavigateFunction, NavigateOptions, To } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "@/app/App";
import { KeycloakProvider } from "@/app/providers/keycloak-provider";
import { ModalProvider } from "@/app/providers/modal-provider";
import { MuiProvider } from "@/app/providers/mui-provider";
import MultiProvider from "@/app/providers/MultiProvider";
import { QueryProvider } from "@/app/providers/query-provider";
import { initializeNavigation } from "@/shared/lib/navigation";
import { enableMocking } from "@/shared/mocks";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

await enableMocking();

const router = createBrowserRouter([{ path: "/*", element: <App /> }]);
const navigateWithRouter: NavigateFunction = (
  to: To | number,
  options?: NavigateOptions,
) => {
  if (typeof to === "number") {
    return router.navigate(to);
  }

  return router.navigate(to, options);
};

initializeNavigation(navigateWithRouter);

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
