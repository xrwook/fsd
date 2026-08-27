import type { ComponentType } from "react";
import { use } from "react";

import { ScreenRouteContext } from "@/shared/lib/router/screen-route";
import type { AliasAny } from "@/shared/lib/types";

import { ModalContext, ModalEntryContext } from "./context";

export const useModal = () => {
  const context = use(ModalContext);
  const entryContext = use(ModalEntryContext);
  // screenId context 추가: 모달을 여는 화면의 route context를 캡처합니다.
  const screenRoute = use(ScreenRouteContext);

  if (!context) {
    throw new Error("useModal must be used within ModalProvider.");
  }

  return {
    open: <T, P extends {} = AliasAny>(
      Component: ComponentType<P>,
      props?: P,
    ) => context.open<T, P>(Component, props, { screenRoute }),
    closeAll: context.closeAll,
    close: (entryContext?.close ?? context.close) as (value?: unknown) => void,
  };
};
