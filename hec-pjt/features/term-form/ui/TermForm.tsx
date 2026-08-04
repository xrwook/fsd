import { RadioButton, RadioGroup, TextArea, TextField } from "@hae-fe/elements";
import { Form, FormField, FormFieldRow } from "@hae-fe/pattern";
import { type ChangeEvent, useEffect } from "react";
import {
  type Control,
  Controller,
  useController,
  useWatch,
} from "react-hook-form";

import { AreaHeader } from "@/shared/ui/area-header";
import { DateTimePicker } from "@/shared/ui/date-time-picker";
import { TiptapEditor } from "@/shared/ui/editor";

import {
  TERM_FORM_DEPLOY_STATUS,
  TERM_RECONSENT_OPTIONS,
  TERM_REQUIRED_OPTIONS,
} from "../model/constant";
import type { TermFormValues } from "../model/termValues";

type Props = {
  control: Control<TermFormValues>;
};

export const TermForm = ({ control }: Props) => {
  const deployStatus = useWatch({
    control,
    name: "deployStatus",
  });

  const { field: reservedAtField } = useController({
    control,
    name: "reservedAt",
  });

  useEffect(() => {
    if (deployStatus !== "R") {
      reservedAtField.onChange(null);
    }
  }, [deployStatus, reservedAtField.onChange]);

  return (
    <>
      <AreaHeader title="약관 정보" />
      <div className="mb-12 flex flex-col gap-2">
        <Form labelWidth={200}>
          <FormFieldRow className="mb-2" cols={1} style={{ gap: "8px" }}>
            <FormField
              label="버전"
              controller={
                <Controller
                  name="ver"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      readOnly
                      hdsProps={{ helpText: "" }}
                      placeholder=""
                      value={field.value}
                    />
                  )}
                />
              }
            />
            <FormFieldRow cols={2}>
              <FormField
                label="동의 구분"
                required
                controller={
                  <Controller
                    name="isRequired"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        className="h-9"
                        direction="horizontal"
                        size="medium"
                        value={String(field.value)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.onChange(e.target.value === "true")
                        }
                      >
                        {TERM_REQUIRED_OPTIONS.map((item) => (
                          <RadioButton
                            key={String(item.value)}
                            id={`term-required-${String(item.value)}`}
                            value={String(item.value)}
                            label={item.label}
                            size="medium"
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                }
              />
              <FormField
                label="기존 회원 재동의 여부"
                required
                controller={
                  <Controller
                    name="isReconsentRequired"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        className="h-9"
                        direction="horizontal"
                        size="medium"
                        value={String(field.value)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.onChange(e.target.value === "true")
                        }
                      >
                        {TERM_RECONSENT_OPTIONS.map((item) => (
                          <RadioButton
                            key={String(item.value)}
                            id={`term-reconsent-${String(item.value)}`}
                            value={String(item.value)}
                            label={item.label}
                            size="medium"
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                }
              />
            </FormFieldRow>
            <FormField
              label="내용"
              required
              style={{ alignItems: "start" }}
              controller={
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              }
            />
            <FormField
              label="개정 사유"
              required
              style={{ alignItems: "start" }}
              controller={
                <Controller
                  name="revisionReason"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      hdsProps={{
                        rows: 4,
                        overflow: false,
                        maxRows: 4,
                        fixedHeight: true,
                      }}
                      placeholder="개정 사유를 입력해 주세요."
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
          </FormFieldRow>
        </Form>
      </div>

      <AreaHeader title="게시 설정" />
      <Form labelWidth={200}>
        <FormFieldRow cols={2}>
          <FormField
            label="게시 상태"
            required
            controller={
              <Controller
                name="deployStatus"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="h-9"
                    direction="horizontal"
                    size="medium"
                    value={field.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.onChange(e.target.value)
                    }
                  >
                    {TERM_FORM_DEPLOY_STATUS.map((item) => (
                      <RadioButton
                        key={item.value}
                        id={`term-deploy-${item.value}`}
                        value={item.value}
                        label={item.label}
                        size="medium"
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            }
          />
          <FormField
            label="예약 게시 일시"
            required={deployStatus === "R"}
            controller={
              <Controller
                name="reservedAt"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    minDate={new Date()}
                    placeholder="YYYY-MM-DD HH"
                    value={field.value}
                    disabled={deployStatus !== "R"}
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
