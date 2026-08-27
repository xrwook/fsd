import { createContext } from "react";

import type { ScreenIdValues } from "@/shared/config";

export type ScreenRouteContextValue = {
  path: string;
  screenId: ScreenIdValues;
};

export const ScreenRouteContext =
  createContext<ScreenRouteContextValue | null>(null);
