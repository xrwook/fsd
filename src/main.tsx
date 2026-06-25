import "@/app.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "@/app/App";
import { KeycloakProvider } from "@/app/providers/keycloak-provider";
import { MuiProvider } from "@/app/providers/mui-provider";
import { QueryProvider } from "@/app/providers/query-provider";
import { enableMocking } from "@/shared/mocks";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

await enableMocking();

createRoot(rootElement).render(
  <StrictMode>
    <QueryProvider>
      <MuiProvider>
        <KeycloakProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </KeycloakProvider>
      </MuiProvider>
    </QueryProvider>
  </StrictMode>,
);
