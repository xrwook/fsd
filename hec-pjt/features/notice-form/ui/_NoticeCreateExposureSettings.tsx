import { RadioButton, RadioGroup } from '@hae-fe/elements';
import { Form, FormField, FormFieldRow } from '@hae-fe/pattern';
import { type Control, Controller, useController, useWatch } from 'react-hook-form';

import { AreaHeader } from '@/shared/ui/area-header';
import { DateTimePicker } from '@/shared/ui/date-time-picker';

import { TERM_DEPLOY_STATUS } from '../model/constant';
import type { NoticeFormValues } from '../model/noticeValues';

type Props = {
  control: Control<NoticeFormValues>;
  initialPublishedAt?: Date | null;
  initialPublishType?: string;
};

const getUpdatePublishedAt = ({
  initialPublishedAt,
  initialPublishType,
  nextPublishType,
}: {
  initialPublishedAt?: Date | null;
  initialPublishType?: string;
  nextPublishType: string;
}) => {
  if (!initialPublishType) {
    return nextPublishType === 'SCHEDULED' ? undefined : null;
  }

  if (nextPublishType === 'SCHEDULED') {
    return initialPublishType === 'SCHEDULED' ? (initialPublishedAt ?? null) : null;
  }

  if (nextPublishType === 'PUBLISHED') {
    return initialPublishType === 'PUBLISHED' ? (initialPublishedAt ?? null) : null;
  }

  if (nextPublishType === 'UNPUBLISHED') {
    return initialPublishType === 'SCHEDULED' ? null : (initialPublishedAt ?? null);
  }

  return null;
};

export const NoticeCreateExposureSettings = ({
  control,
  initialPublishedAt,
  initialPublishType,
}: Props) => {
  const publishType = useWatch({
    control,
    name: 'publishType',
  });

  const { field: scheduledAtField } = useController({
    control,
    name: 'publishedAt',
  });

  const handlePublishTypeChange = (nextPublishType: string, onChange: (value: string) => void) => {
    const nextPublishedAt = getUpdatePublishedAt({
      initialPublishedAt,
      initialPublishType,
      nextPublishType,
    });

    onChange(nextPublishType);

    if (nextPublishedAt !== undefined) {
      scheduledAtField.onChange(nextPublishedAt ?? null);
    }
  };

  return (
    <>
      <AreaHeader title="노출 설정" />

      <Form labelWidth={200}>
        <FormFieldRow cols={2}>
          <FormField
            label="게시 상태"
            required
            controller={
              <Controller
                name="publishType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="h-9"
                    direction="horizontal"
                    size="medium"
                    value={field.value}
                    onChange={e => handlePublishTypeChange(e.target.value, field.onChange)}
                  >
                    {TERM_DEPLOY_STATUS.map(x => {
                      const value = `${x.value}`;
                      return <RadioButton key={value} id={value} value={value} label={x.label} size="medium" />;
                    })}
                  </RadioGroup>
                )}
              />
            }
          />

          <FormField
            label="게시일"
            required={publishType === 'SCHEDULED'}
            controller={
              <Controller
                name="publishedAt"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    minDate={new Date()}
                    placeholder="YYYY-MM-DD HH"
                    value={field.value}
                    disabled={publishType !== 'SCHEDULED'}
                    onChange={field.onChange}
                  />
                )}
              />
            }
          />
        </FormFieldRow>
      </Form>
    </>
  );
};
