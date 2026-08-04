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

import { useGetTermTypeListQuery } from "../../terms-list/api";
import {
  useCreateTermVersionMutation,
  useGetTermNextVersionQuery,
} from "../api";

const TermsCreatePage = () => {
  const { termCode = "" } = useParams();
  const skipRef = useRef(false);
  const { snackbar } = useSystemModal();
  const { data: termTypeResponse } = useGetTermTypeListQuery();
  const { data: nextVersionResponse } = useGetTermNextVersionQuery(
    {
      path: {
        termCode,
      },
    },
    !!termCode,
  );
  const { mutate: createTermVersion } = useCreateTermVersionMutation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<TermFormValues>({
    defaultValues: {
      ...DEFAULT_VALUES,
      termCode,
    },
    mode: "onChange",
    resolver: zodResolver(termValueSchema),
  });

  useLeaveConfirm({ isDirty, skipRef });

  useEffect(() => {
    if (!termCode) return;

    reset({
      ...DEFAULT_VALUES,
      termCode,
      ver: nextVersionResponse?.data.nextVersion ?? "",
    });
  }, [nextVersionResponse?.data.nextVersion, reset, termCode]);

  const termName =
    termTypeResponse?.data.find((term) => term.termCode === termCode)
      ?.termName ?? "약관";

  const onSubmit = handleSubmit((values) => {
    createTermVersion(
      {
        requestBody: {
          termCode: values.termCode,
          isRequired: values.isRequired,
          isReconsentRequired: values.isReconsentRequired,
          content: values.content,
          revisionReason: values.revisionReason,
          isReserved: values.deployStatus === "R",
          reservedAt:
            values.deployStatus === "R" && values.reservedAt
              ? formatUtc(values.reservedAt)
              : null,
        },
      },
      {
        onSuccess: () => {
          snackbar({ message: "등록이 완료되었습니다." });
          skipRef.current = true;
          navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS);
        },
      },
    );
  });

  return (
    <PageLayout
      title={`${termName} 등록`}
      headerButtonItems={[
        {
          label: "취소",
          variant: "ghost",
          onClick: () =>
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS),
        },
        {
          label: "등록",
          variant: "primary",
          onClick: onSubmit,
          disabled: !isValid || !termCode,
        },
      ]}
    >
      <TermForm control={control} />
    </PageLayout>
  );
};

export default TermsCreatePage;
