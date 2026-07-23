import { useContext } from "react";

import { ModalContext, ModalEntryContext } from "./context";

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within ModalProvider.");
  }

  return context;
};

export const useModalEntry = () => {
  const context = useContext(ModalEntryContext);

  if (!context) {
    throw new Error("useModalEntry must be used within ModalProvider modal entry.");
  }

  return context;
};
