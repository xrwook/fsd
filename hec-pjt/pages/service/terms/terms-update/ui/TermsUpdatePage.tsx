import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import {
  DEFAULT_VALUES,
  TermForm,
  type TermFormValues,
} from "@/features/term-form";
import { termValueSchema } from "@/features/term-form/model/schema";
import { SCREEN_ID } from "@/shared/config";
import { formatUtc } from "@/shared/lib/date";
import { useSystemModal } from "@/shared/lib/modal";
import { navigateToScreen } from "@/shared/lib/navigation/navigation";
import { useLeaveConfirm } from "@/shared/lib/router";
import { PageLayout } from "@/widgets/layout/ui";

import { useGetTermDetailQuery } from "../../terms-detail/api";
import { useUpdateTermVersionMutation } from "../api";

const TermsUpdatePage = () => {
  const { id = "" } = useParams();
  const skipRef = useRef(false);
  const { snackbar } = useSystemModal();
  const { data: detail } = useGetTermDetailQuery(
    {
      path: {
        id,
      },
    },
    !!id,
  );
  const { mutate: updateTermVersion } = useUpdateTermVersionMutation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<TermFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
    resolver: zodResolver(termValueSchema),
  });

  useLeaveConfirm({ isDirty, skipRef });

  useEffect(() => {
    if (!detail) return;

    reset({
      termCode: detail.termCode,
      ver: detail.ver,
      isRequired: detail.isRequired,
      isReconsentRequired: detail.isReconsentRequired,
      content: detail.content,
      revisionReason: detail.revisionReason,
      deployStatus: detail.deployStatus === "R" ? "R" : "D",
      reservedAt: detail.reservedAt ? new Date(detail.reservedAt) : null,
    });
  }, [detail, reset]);

  const onSubmit = handleSubmit((values) => {
    updateTermVersion(
      {
        path: {
          id,
        },
        requestBody: {
          isRequired: values.isRequired,
          isReconsentRequired: values.isReconsentRequired,
          content: values.content,
          revisionReason: values.revisionReason,
          deployStatus: values.deployStatus,
          reservedAt:
            values.deployStatus === "R" && values.reservedAt
              ? formatUtc(values.reservedAt)
              : null,
        },
      },
      {
        onSuccess: () => {
          snackbar({ message: "수정이 완료되었습니다." });
          skipRef.current = true;
          navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS);
        },
      },
    );
  });

  const canUpdate = detail?.deployStatus === "R";

  return (
    <PageLayout
      title={`${detail?.termCode ?? "약관"} 수정`}
      headerButtonItems={[
        {
          label: "취소",
          variant: "ghost",
          onClick: () =>
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS),
        },
        {
          label: "저장",
          variant: "primary",
          onClick: onSubmit,
          disabled: !isValid || !canUpdate,
        },
      ]}
    >
      <TermForm control={control} />
    </PageLayout>
  );
};

export default TermsUpdatePage;
