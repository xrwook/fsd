import type { ComponentType, PropsWithChildren } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

import type { ModalEntry, ModalOpenOptions } from "@/shared/lib/modal/context";
import { ModalContext, ModalEntryContext } from "@/shared/lib/modal/context";
import { ScreenRouteContext } from "@/shared/lib/router/screen-route";
import type { AliasAny } from "@/shared/lib/types";

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [stack, setStack] = useState<ModalEntry[]>([]);

  const open = useCallback(
    <T = undefined, P extends {} = AliasAny>(
      Component: ComponentType<P>,
      props?: P,
      options?: ModalOpenOptions,
    ): Promise<T | undefined> => {
      const id = crypto.randomUUID();

      return new Promise<T | undefined>((resolve) => {
        setStack((prev) => [
          ...prev,
          {
            Component,
            props: props as Record<string, unknown> | undefined,
            id,
            resolve: resolve as (value: unknown) => void,
            // screenId context 추가: 모달을 연 화면의 route context를 entry에 보관합니다.
            screenRoute: options?.screenRoute ?? null,
          },
        ]);
      });
    },
    [],
  );

  const close = useCallback((id: string, value?: unknown) => {
    setStack((prev) => {
      const modal = prev.find((m) => m.id === id);
      modal?.resolve(value);
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const closeAll = useCallback(() => {
    setStack((prev) => {
      for (const modal of prev) modal.resolve(null);
      return [];
    });
  }, []);

  return (
    <ModalContext value={{ close, closeAll, open, stack }}>
      {children}
      {createPortal(
        stack.map(({ id, Component, props, screenRoute }) => {
          const modalEntry = (
            <ModalEntryContext
              key={id}
              value={{ close: (value?: unknown) => close(id, value) }}
            >
              <div data-modal-id={id}>
                <Component {...props} />
              </div>
            </ModalEntryContext>
          );

          if (!screenRoute) {
            return modalEntry;
          }

          // screenId context 추가: portal 내부 모달에 route context를 다시 주입합니다.
          return (
            <ScreenRouteContext.Provider key={id} value={screenRoute}>
              {modalEntry}
            </ScreenRouteContext.Provider>
          );
        }),
        document.body,
      )}
    </ModalContext>
  );
};
