import { useCallback } from "react";

import { useSystemModal } from "@/shared/lib/modal";

type UseModalLeaveConfirmOptions = {
  isDirty: boolean;
  message?: string;
};

const DEFAULT_MESSAGE = "변경된 내용이 저장되지 않습니다. 닫으시겠습니까?";

export const useModalLeaveConfirm = ({
  isDirty,
  message = DEFAULT_MESSAGE,
}: UseModalLeaveConfirmOptions) => {
  const { confirm } = useSystemModal();

  const confirmLeave = useCallback(async () => {
    if (!isDirty) return true;

    return await confirm({ message });
  }, [confirm, isDirty, message]);

  return { confirmLeave };
};
