import type { ComponentType } from "react";
import { createContext } from "react";

export type ModalEntry = {
  id: string;
  Component: ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  resolve: (value?: unknown) => void;
};

export type ModalOpen = {
  <Result = undefined>(Component: ComponentType): Promise<Result | undefined>;
  <Result = undefined, Props extends object = object>(
    Component: ComponentType<Props>,
    props: Props,
  ): Promise<Result | undefined>;
};

export type ModalContextValue = {
  stack: ModalEntry[];
  open: ModalOpen;
  close: (id: string, value?: unknown) => void;
  closeAll: () => void;
};

export type ModalEntryContextValue = {
  id: string;
  close: <Result = undefined>(value?: Result) => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);
export const ModalEntryContext =
  createContext<ModalEntryContextValue | null>(null);
