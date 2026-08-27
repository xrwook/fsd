import { useContext } from "react";

import { ScreenRouteContext } from "./context";

export const useScreenRoute = () => {
  const context = useContext(ScreenRouteContext);

  if (!context) {
    throw new Error("useScreenRoute must be used within ScreenRouteProvider.");
  }

  return context;
};
