import { Badge, Typography } from "@hae-fe/elements";
import { Form, FormField, FormFieldRow } from "@hae-fe/pattern";

import { BADGE_PROPS } from "@/features/term-form/model/constant";
import { formatDateTime } from "@/shared/lib/date";
import { AreaHeader } from "@/shared/ui/area-header";

import type { TermDetailData } from "../api";

type Props = {
  data?: TermDetailData;
};

const getDeployAt = (data?: TermDetailData) => {
  if (!data) return null;

  return data.reservedAt || data.deployStartAt;
};

export const TermsDetailDeploySettings = ({ data }: Props) => {
  const badgeInfo =
    data && BADGE_PROPS[data.deployStatus as keyof typeof BADGE_PROPS];

  return (
    <>
      <AreaHeader title="게시 설정" />
      <Form labelWidth={200}>
        <FormFieldRow cols={2}>
          <FormField
            label="게시 상태"
            controller={
              <div className="flex h-9 items-center">
                {badgeInfo && (
                  <Badge
                    type="text"
                    semantic={badgeInfo.semantic}
                    size="small"
                    styleOption={badgeInfo.styleOption}
                    badgeContent={badgeInfo.badgeContent}
                  />
                )}
              </div>
            }
          />
          <FormField
            label="게시 일시"
            controller={
              <Typography
                className="leading-9 text-(--color-text-neutral-stronger)"
                hdsProps={{ size: "15", type: "body", weight: "regular" }}
              >
                {formatDateTime(getDeployAt(data))}
              </Typography>
            }
          />
          <FormField
            label="수정자"
            controller={
              <Typography
                className="leading-9 text-(--color-text-neutral-stronger)"
                hdsProps={{ size: "15", type: "body", weight: "regular" }}
              >
                {data?.modifiedByName ?? "-"}
              </Typography>
            }
          />
          <FormField
            label="최종 수정일"
            controller={
              <Typography
                className="leading-9 text-(--color-text-neutral-stronger)"
                hdsProps={{ size: "15", type: "body", weight: "regular" }}
              >
                {formatDateTime(data?.modifiedDate)}
              </Typography>
            }
          />
        </FormFieldRow>
      </Form>
    </>
  );
};
