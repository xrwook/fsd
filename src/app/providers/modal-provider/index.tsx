import type { ComponentType, PropsWithChildren } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  ModalContext,
  type ModalContextValue,
  type ModalEntry,
  ModalEntryContext,
  type ModalOpen,
} from "@/shared/lib/modal";

let modalIdSequence = 0;

const createModalId = () => {
  modalIdSequence += 1;
  return `modal-${modalIdSequence}`;
};

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [stack, setStack] = useState<ModalEntry[]>([]);
  const stackRef = useRef<ModalEntry[]>([]);

  const setModalStack = useCallback((nextStack: ModalEntry[]) => {
    stackRef.current = nextStack;
    setStack(nextStack);
  }, []);

  const open = useCallback(
    <Result = undefined, Props extends object = object>(
      Component: ComponentType<Props>,
      props?: Props,
    ) => {
      const id = createModalId();

      return new Promise<Result | undefined>((resolve) => {
        const entry: ModalEntry = {
          id,
          Component: Component as ComponentType<Record<string, unknown>>,
          props: props as Record<string, unknown> | undefined,
          resolve: (value?: unknown) => {
            resolve(value as Result | undefined);
          },
        };

        setModalStack([...stackRef.current, entry]);
      });
    },
    [setModalStack],
  );

  const close = useCallback(
    (id: string, value?: unknown) => {
      const modal = stackRef.current.find((entry) => entry.id === id);

      if (!modal) {
        return;
      }

      setModalStack(stackRef.current.filter((entry) => entry.id !== id));
      modal.resolve(value);
    },
    [setModalStack],
  );

  const closeAll = useCallback(() => {
    const currentStack = stackRef.current;

    if (currentStack.length === 0) {
      return;
    }

    setModalStack([]);

    for (const modal of currentStack) {
      modal.resolve();
    }
  }, [setModalStack]);

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      close,
      closeAll,
      open: open as ModalOpen,
      stack,
    }),
    [close, closeAll, open, stack],
  );

  const portalContainer =
    typeof document === "undefined" ? null : document.body;

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {portalContainer
        ? createPortal(
            stack.map(({ Component, id, props }) => (
              <ModalEntryContext.Provider
                key={id}
                value={{
                  close: (value?: unknown) => {
                    close(id, value);
                  },
                  id,
                }}
              >
                <div data-modal-id={id}>
                  <Component {...(props ?? {})} />
                </div>
              </ModalEntryContext.Provider>
            )),
            portalContainer,
          )
        : null}
    </ModalContext.Provider>
  );
};
