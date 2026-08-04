import { Typography } from "@hae-fe/elements";
import { Form, FormField, FormFieldRow } from "@hae-fe/pattern";

import {
  TERM_RECONSENT_LABEL,
  TERM_REQUIRED_LABEL,
} from "@/features/term-form/model/constant";
import { AreaHeader } from "@/shared/ui/area-header";
import { TiptapViewer } from "@/shared/ui/editor";

import type { TermDetailData } from "../api";

type Props = {
  data?: TermDetailData;
};

const getBooleanLabel = (
  value: boolean | undefined,
  labelMap: Record<"false" | "true", string>,
) => {
  if (value === undefined) return "-";

  return labelMap[String(value) as "false" | "true"];
};

export const TermsDetailBasicInfo = ({ data }: Props) => {
  return (
    <>
      <AreaHeader title="약관 정보" />
      <div className="mb-12 flex flex-col gap-2">
        <Form labelWidth={200}>
          <FormFieldRow className="mb-2" cols={1} style={{ gap: "8px" }}>
            <FormField
              label="버전"
              controller={
                <Typography
                  className="leading-9 text-(--color-text-neutral-stronger)"
                  hdsProps={{ size: "15", type: "body", weight: "regular" }}
                >
                  {data?.ver ?? "-"}
                </Typography>
              }
            />
            <FormFieldRow cols={2}>
              <FormField
                label="동의 구분"
                controller={
                  <Typography
                    className="leading-9 text-(--color-text-neutral-stronger)"
                    hdsProps={{ size: "15", type: "body", weight: "regular" }}
                  >
                    {getBooleanLabel(data?.isRequired, TERM_REQUIRED_LABEL)}
                  </Typography>
                }
              />
              <FormField
                label="기존 회원 재동의 여부"
                controller={
                  <Typography
                    className="leading-9 text-(--color-text-neutral-stronger)"
                    hdsProps={{ size: "15", type: "body", weight: "regular" }}
                  >
                    {getBooleanLabel(
                      data?.isReconsentRequired,
                      TERM_RECONSENT_LABEL,
                    )}
                  </Typography>
                }
              />
            </FormFieldRow>
            <FormField
              label="내용"
              style={{ alignItems: "start" }}
              controller={<TiptapViewer value={data?.content ?? ""} />}
            />
            <FormField
              label="개정 사유"
              style={{ alignItems: "start" }}
              controller={
                <Typography
                  className="leading-9 text-(--color-text-neutral-stronger)"
                  hdsProps={{ size: "15", type: "body", weight: "regular" }}
                >
                  {data?.revisionReason ?? "-"}
                </Typography>
              }
            />
          </FormFieldRow>
        </Form>
      </div>
    </>
  );
};
