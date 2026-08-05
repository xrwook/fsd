import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  type DropdownOption,
} from "@hae-fe/elements";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  DEFAULT_VALUES,
  FaqForm,
  type FaqFormValues,
  faqValueSchema,
} from "@/features/faq-form";

import { useModalLeaveConfirm } from "../../../../../lib/useModalLeaveConfirm";

import { useGetFaqTop10StatusQuery } from "../api/faqCreate";

interface FaqCreateModalProps {
  categoryOptions?: DropdownOption[];
  modalOpen: boolean;
  onModalOpen: (value: boolean) => void;
  onSubmit: (values: FaqFormValues) => Promise<void> | void;
}

export const FaqCreateModal = ({
  categoryOptions,
  modalOpen,
  onModalOpen,
  onSubmit,
}: FaqCreateModalProps) => {
  const { data: top10StatusResponse } = useGetFaqTop10StatusQuery(
    {},
    modalOpen,
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitSuccessful, isSubmitting, isValid },
  } = useForm<FaqFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
    resolver: zodResolver(faqValueSchema),
  });
  const { confirmLeave } = useModalLeaveConfirm({
    isDirty: isDirty && !isSubmitSuccessful,
  });

  const handleCancel = async () => {
    const confirmed = await confirmLeave();
    if (!confirmed) return;

    reset(DEFAULT_VALUES);
    onModalOpen(false);
  };

  const handleConfirm = handleSubmit(async (values) => {
    await onSubmit(values);

    reset(DEFAULT_VALUES);
    onModalOpen(false);
  });

  return (
    <Dialog
      hdsProps={{ hasFooter: true, hasHeader: true, maxWidth: "sm" }}
      open={modalOpen}
      onClose={handleCancel}
    >
      <DialogHeader
        hdsProps={{ showCloseIcon: true, onClose: handleCancel }}
        className="min-w-120"
      >
        FAQ 등록
      </DialogHeader>
      <DialogContent>
        <FaqForm
          categoryOptions={categoryOptions}
          control={control}
          top10LimitError={
            !!top10StatusResponse?.data &&
            !top10StatusResponse.data.isTop10Available
          }
        />
      </DialogContent>
      <DialogFooter
        hdsProps={{
          negativeButton: { children: "취소", onClick: handleCancel },
          positiveButton: {
            children: "등록",
            onClick: handleConfirm,
            disabled: !isValid || isSubmitting,
          },
        }}
      />
    </Dialog>
  );
};
