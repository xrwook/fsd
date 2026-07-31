import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  type DropdownOption,
} from "@hae-fe/elements";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  DEFAULT_VALUES,
  FaqForm,
  type FaqFormValues,
  faqValueSchema,
} from "@/features/faq-form";

interface FaqUpdateModalProps {
  categoryOptions?: DropdownOption[];
  defaultValues?: FaqFormValues;
  modalOpen: boolean;
  onModalOpen: (value: boolean) => void;
  onSubmit: (values: FaqFormValues) => void;
}

export const FaqUpdateModal = ({
  categoryOptions,
  defaultValues = DEFAULT_VALUES,
  modalOpen,
  onModalOpen,
  onSubmit,
}: FaqUpdateModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FaqFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(faqValueSchema),
  });

  useEffect(() => {
    if (modalOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, modalOpen, reset]);

  const handleCancel = () => {
    reset(defaultValues);
    onModalOpen(false);
  };

  const handleConfirm = handleSubmit((values) => {
    onModalOpen(false);
    onSubmit(values);
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
        FAQ 수정
      </DialogHeader>
      <DialogContent>
        <FaqForm categoryOptions={categoryOptions} control={control} />
      </DialogContent>
      <DialogFooter
        hdsProps={{
          negativeButton: { children: "취소", onClick: handleCancel },
          positiveButton: {
            children: "수정",
            onClick: handleConfirm,
            disabled: !isValid,
          },
        }}
      />
    </Dialog>
  );
};
