import { useCallback } from "react";

import { API_ERROR_MESSAGES } from "@/shared/lib/api/constants";

import {
  TermTypeManageModal as TermTypeManageModalCommon,
  type TermTypeItem,
  type TermTypeSaveItem,
} from "../../../../../features/term-type-manage-modal";
import {
  useDeleteTermTypeMutation,
  useGetTermTypeListQuery,
  useSaveTermTypesMutation,
} from "../api";

type Props = {
  open: boolean;
  onOpen: (open: boolean) => void;
  onSave: () => void;
};

type MutationOptions = {
  onSuccess: () => void;
  onError: (message: string, nextItems?: TermTypeItem[]) => void;
};

const getErrorData = (error: unknown) => {
  if (typeof error !== "object" || !error) {
    return {
      code: "",
      message: "",
    };
  }

  const apiError = error as {
    response?: {
      data?: {
        code?: unknown;
        message?: unknown;
      };
    };
  };
  const code = apiError.response?.data?.code;
  const message = apiError.response?.data?.message;

  return {
    code: typeof code === "string" ? code : "",
    message: typeof message === "string" ? message : "",
  };
};

export const TermTypeManageModal = ({ open, onOpen, onSave }: Props) => {
  const { data: termsResponse, refetch } = useGetTermTypeListQuery();
  const { mutate: saveTermTypes } = useSaveTermTypesMutation();
  const { mutate: deleteTermType } = useDeleteTermTypeMutation();

  const handleSaveItems = useCallback(
    (items: TermTypeSaveItem[], { onError, onSuccess }: MutationOptions) => {
      saveTermTypes(
        {
          requestBody: {
            items,
          },
        },
        {
          onSuccess: () => onSuccess(),
          onError: async (error) => {
            const { code, message: responseMessage } = getErrorData(error);
            const message = API_ERROR_MESSAGES[code] || responseMessage || "";
            const { data } = await refetch();
            onError(message, data?.data || []);
          },
        },
      );
    },
    [refetch, saveTermTypes],
  );

  const handleDeleteItem = useCallback(
    (termCode: string, { onError, onSuccess }: MutationOptions) => {
      deleteTermType(
        {
          path: {
            termCode,
          },
        },
        {
          onSuccess: () => onSuccess(),
          onError: async (error) => {
            const { code, message: responseMessage } = getErrorData(error);
            const message = API_ERROR_MESSAGES[code] || responseMessage || "";
            const { data } = await refetch();
            onError(message, data?.data || []);
          },
        },
      );
    },
    [deleteTermType, refetch],
  );

  return (
    <TermTypeManageModalCommon
      open={open}
      onOpen={onOpen}
      items={termsResponse?.data}
      onSave={onSave}
      onSaveItems={handleSaveItems}
      onDeleteItem={handleDeleteItem}
    />
  );
};
