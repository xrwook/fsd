import { Badge, Typography } from '@hae-fe/elements';
import { Form, FormField, FormFieldRow } from '@hae-fe/pattern';

import type { NoticeDetailData } from '@/entities/service/model/noticeDetailSchema';
import { BADGE_PROPS } from '@/features/notice-form/model/constant';
import { formatDateTime } from '@/shared/lib/date';
import { AreaHeader } from '@/shared/ui/area-header';

type Props = {
  data?: NoticeDetailData;
};
type PublishType = keyof typeof BADGE_PROPS;

export const NoticeDetailExposureSettings = ({ data }: Props) => {
  const publishType = data?.publishType as PublishType;
  const badgeInfo = BADGE_PROPS[publishType];
  return (
    <>
      <AreaHeader title="노출 설정" />
      <Form labelWidth={200}>
        <FormFieldRow cols={2}>
          <FormField
            controller={
              <div>
                {badgeInfo && (
                  <Badge
                    badgeContent={badgeInfo.badgeContent}
                    className="inline-block"
                    semantic={badgeInfo.semantic}
                    size="small"
                    styleOption={badgeInfo.styleOption}
                    type="text"
                  />
                )}
              </div>
            }
            label="게시 상태"
          />
          <FormField
            controller={
              <Typography
                className="leading-9 text-(--color-text-neutral-stronger)"
                hdsProps={{ size: '15', type: 'body', weight: 'regular' }}
              >
                {formatDateTime(data?.publishedAt)}
              </Typography>
            }
            label="게시 일시"
          />
        </FormFieldRow>
      </Form>
    </>
  );
};
