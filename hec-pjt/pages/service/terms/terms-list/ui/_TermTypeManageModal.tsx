import { useCallback } from "react";

import {
  TermTypeManageModal as TermTypeManageModalCommon,
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
};

export const TermTypeManageModal = ({ open, onOpen, onSave }: Props) => {
  const { data: termsResponse } = useGetTermTypeListQuery();
  const { mutate: saveTermTypes } = useSaveTermTypesMutation();
  const { mutate: deleteTermType } = useDeleteTermTypeMutation();

  const handleSaveItems = useCallback(
    (items: TermTypeSaveItem[], { onSuccess }: MutationOptions) => {
      saveTermTypes(
        {
          requestBody: {
            items,
          },
        },
        {
          onSuccess: () => onSuccess(),
        },
      );
    },
    [saveTermTypes],
  );

  const handleDeleteItem = useCallback(
    (termCode: string, { onSuccess }: MutationOptions) => {
      deleteTermType(
        {
          path: {
            termCode,
          },
        },
        {
          onSuccess: () => onSuccess(),
        },
      );
    },
    [deleteTermType],
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
