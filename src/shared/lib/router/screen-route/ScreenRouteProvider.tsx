import type { PropsWithChildren } from "react";

import {
  ScreenRouteContext,
  type ScreenRouteContextValue,
} from "./context";

type ScreenRouteProviderProps = PropsWithChildren<{
  value: ScreenRouteContextValue;
}>;

export const ScreenRouteProvider = ({
  children,
  value,
}: ScreenRouteProviderProps) => {
  return (
    <ScreenRouteContext.Provider value={value}>
      {children}
    </ScreenRouteContext.Provider>
  );
};
