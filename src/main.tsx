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
import { enableMocking } from "@/shared/mocks";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

await enableMocking();

const router = createBrowserRouter([{ path: "/*", element: <App /> }]);

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
