import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/app/App";
import { MuiProvider } from "@/app/providers/mui-provider";
import { QueryProvider } from "@/app/providers/query-provider";
import { enableMocking } from "@/shared/mocks";
import "@/app.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryProvider>
        <MuiProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MuiProvider>
      </QueryProvider>
    </StrictMode>,
  );
});
