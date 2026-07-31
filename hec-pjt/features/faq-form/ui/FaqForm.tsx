import {
  Checkbox,
  DateTimePicker,
  Dropdown,
  type DropdownOption,
  RadioButton,
  RadioGroup,
  TextArea,
  TextField,
  Typography,
} from "@hae-fe/elements";
import { Form, FormField, FormFieldRow } from "@hae-fe/pattern";
import { type ChangeEvent, useEffect } from "react";
import {
  type Control,
  Controller,
  useController,
  useWatch,
} from "react-hook-form";

import { FAQ_PUBLISH_STATUS } from "../model/constant";
import type { FaqFormValues } from "../model/faqValues";

type Props = {
  control: Control<FaqFormValues>;
  categoryOptions?: DropdownOption[];
  readOnly?: boolean;
  top10LimitError?: boolean;
};

export const FaqForm = ({
  control,
  categoryOptions = [],
  readOnly = false,
  top10LimitError = false,
}: Props) => {
  const publishType = useWatch({
    control,
    name: "publishType",
  });
  const isTop10 = useWatch({
    control,
    name: "isTop10",
  });
  const showTop10LimitError = top10LimitError && isTop10 && !readOnly;

  const { field: scheduledAtField } = useController({
    control,
    name: "scheduledAt",
  });
  const getSelectedCategory = (value: string) => {
    return categoryOptions.find((option) => option.value === value) ?? null;
  };

  useEffect(() => {
    if (publishType !== "SCHEDULED") {
      scheduledAtField.onChange(null);
    }
  }, [publishType, scheduledAtField.onChange]);

  return (
    <>
      <Form labelWidth={96}>
        <FormFieldRow cols={1}>
          <FormField
            label="카테고리"
            required={!readOnly}
            layout="vertical"
            colon={false}
            controlId=""
            controller={
              <Controller
                name="faqCategoryId"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    readOnly={readOnly}
                    hdsProps
                    value={getSelectedCategory(field.value)}
                    onChange={(
                      option: DropdownOption | DropdownOption[] | null,
                    ) => {
                      if (!Array.isArray(option)) {
                        field.onChange(option?.value ? `${option.value}` : "");
                      }
                    }}
                    options={categoryOptions}
                    placeholder="카테고리를 선택해 주세요."
                  />
                )}
              />
            }
          />
          <FormField
            label="질문"
            required={!readOnly}
            layout="vertical"
            colon={false}
            controlId=""
            controller={
              <Controller
                name="question"
                control={control}
                render={({ field }) => (
                  <TextField
                    readOnly={readOnly}
                    hdsProps={{ helpText: "", clearable: false }}
                    placeholder="질문을 입력해 주세요"
                    value={field.value}
                    id=""
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.onChange(e.target.value)
                    }
                    onClear={() => field.onChange("")}
                  />
                )}
              />
            }
          />
          <FormField
            label="답변"
            required={!readOnly}
            layout="vertical"
            colon={false}
            controlId=""
            controller={
              <Controller
                name="answer"
                control={control}
                render={({ field }) => (
                  <TextArea
                    readOnly={readOnly}
                    hdsProps={{
                      rows: 7,
                      overflow: false,
                      maxRows: 7,
                      fixedHeight: true,
                    }}
                    placeholder="답변을 입력해 주세요."
                    value={field.value}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      field.onChange(e.target.value)
                    }
                    style={{ resize: "none" }}
                  />
                )}
              />
            }
          />
          <FormField
            label="게시 상태"
            required={!readOnly}
            controller={
              <Controller
                name="publishType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    size="medium"
                    direction="horizontal"
                    value={field.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.onChange(e.target.value)
                    }
                    className="h-9"
                  >
                    {FAQ_PUBLISH_STATUS.map((item) => {
                      const value = `${item.value}`;

                      return (
                        <RadioButton
                          key={value}
                          size="medium"
                          readOnly={readOnly}
                          label={item.label}
                          value={value}
                          id={value}
                        />
                      );
                    })}
                  </RadioGroup>
                )}
              />
            }
          />
          <FormField
            label="게시일"
            required={!readOnly && publishType === "SCHEDULED"}
            controller={
              <Controller
                name="scheduledAt"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    readOnly={readOnly}
                    value={field.value}
                    onChange={(newValue: Date | null) =>
                      field.onChange(newValue)
                    }
                    disabled={publishType !== "SCHEDULED"}
                    placeholder="YYYY-MM-DD HH"
                    minDate={new Date()}
                  />
                )}
              />
            }
          />
        </FormFieldRow>
      </Form>
      <div className="mt-5 flex h-8 items-center">
        <Controller
          name="isTop10"
          control={control}
          render={({ field }) => (
            <Checkbox
              size="medium"
              disabled={readOnly}
              error={showTop10LimitError}
              label="TOP 10 목록에 추가"
              checked={field.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                field.onChange(e.target.checked)
              }
            />
          )}
        />
      </div>
      {showTop10LimitError && (
        <Typography
          className="pl-7.5 text-(--color-text-attention-strong)"
          hdsProps={{ weight: "regular", type: "body", size: "13" }}
        >
          TOP 10은 최대 10개까지 설정할 수 있습니다.
        </Typography>
      )}
    </>
  );
};
