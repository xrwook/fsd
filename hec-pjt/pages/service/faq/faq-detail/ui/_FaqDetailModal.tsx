import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  type DropdownOption,
} from "@hae-fe/elements";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  FaqForm,
  type FaqFormValues,
  faqValueSchema,
} from "@/features/faq-form";

import { useGetFaqTop10StatusQuery } from "../../faq-create/api/faqCreate";
import { type FaqDetailData, useGetFaqDetailQuery } from "../api/faqDetail";

const EMPTY_DETAIL_VALUES: FaqFormValues = {
  faqCategoryId: "",
  question: "",
  answer: "",
  publishType: "",
  scheduledAt: null,
  isTop10: false,
};

interface FaqDetailModalProps {
  categoryOptions?: DropdownOption[];
  id?: string;
  modalOpen: boolean;
  onModalOpen: (value: boolean) => void;
  onSubmit: (values: FaqFormValues) => void;
  onDelete: (detail?: FaqDetailData) => void;
}

export const FaqDetailModal = ({
  categoryOptions,
  id,
  modalOpen,
  onModalOpen,
  onSubmit,
  onDelete,
}: FaqDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: detailResponse } = useGetFaqDetailQuery(
    {
      path: {
        id: id ?? "",
      },
    },
    modalOpen && !!id,
  );
  const { data: top10StatusResponse } = useGetFaqTop10StatusQuery(
    {
      query: {
        id,
      },
    },
    modalOpen && isEditing && !!id,
  );
  const detail = detailResponse?.data;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FaqFormValues>({
    defaultValues: EMPTY_DETAIL_VALUES,
    mode: "onChange",
    resolver: zodResolver(faqValueSchema),
  });

  useEffect(() => {
    if (!detail || !modalOpen) return;

    reset({
      faqCategoryId: detail.faqCategoryId,
      question: detail.question,
      answer: detail.answer,
      publishType: detail.publishType,
      scheduledAt: detail.scheduledAt ? new Date(detail.scheduledAt) : null,
      isTop10: detail.isTop10,
      version: detail.version,
    });
  }, [detail, modalOpen, reset]);

  const handleCancel = () => {
    setIsEditing(false);
    reset(EMPTY_DETAIL_VALUES);
    onModalOpen(false);
  };

  const handleDelete = () => {
    setIsEditing(false);
    onDelete(detail);
  };

  const handleConfirm = handleSubmit((values) => {
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
        {isEditing ? "FAQ 수정" : "FAQ 상세"}
      </DialogHeader>
      <DialogContent>
        <FaqForm
          categoryOptions={categoryOptions}
          control={control}
          readOnly={!isEditing}
          top10LimitError={
            isEditing &&
            !!top10StatusResponse?.data &&
            !top10StatusResponse.data.isTop10Available
          }
        />
      </DialogContent>
      {!isEditing && (
        <DialogFooter
          hdsProps={{
            negativeButton: {
              children: "삭제",
              onClick: handleDelete,
              semantic: "attention",
            },
            positiveButton: {
              children: "수정",
              onClick: () => setIsEditing(true),
            },
          }}
        />
      )}
      {isEditing && (
        <DialogFooter
          hdsProps={{
            negativeButton: {
              children: "삭제",
              onClick: handleDelete,
              semantic: "attention",
            },
            positiveButton: {
              children: "저장",
              onClick: handleConfirm,
              disabled: !isValid,
            },
          }}
        />
      )}
    </Dialog>
  );
};
