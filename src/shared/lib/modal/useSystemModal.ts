import type { AliasAny } from "@/shared/lib/types";

import { useModal } from "./useModal";

export const useSystemModal = (): AliasAny => {
  return useModal();
};
