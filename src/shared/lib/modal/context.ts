import type { ComponentType } from "react";
import { createContext } from "react";

import type { ScreenRouteContextValue } from "@/shared/lib/router/screen-route";
import type { AliasAny } from "@/shared/lib/types";

export type ModalOpenOptions = {
  screenRoute?: ScreenRouteContextValue | null;
};

export type ModalEntry = {
  Component: ComponentType<AliasAny>;
  props?: Record<string, unknown>;
  id: string;
  resolve: (value: unknown) => void;
  screenRoute?: ScreenRouteContextValue | null;
};

export type ModalContextValue = {
  close: (id: string, value?: unknown) => void;
  closeAll: () => void;
  open: <T, P extends {} = AliasAny>(
    Component: ComponentType<P>,
    props?: P,
    options?: ModalOpenOptions,
  ) => Promise<T | undefined>;
  stack: ModalEntry[];
};

export type ModalEntryContextValue = {
  close: (value?: unknown) => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);
export const ModalEntryContext =
  createContext<ModalEntryContextValue | null>(null);
