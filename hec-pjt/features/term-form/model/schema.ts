import { z } from "zod";

export const termValueSchema = z
  .object({
    termCode: z.string().trim().min(1),
    ver: z.string().trim().min(1),
    isRequired: z.boolean(),
    isReconsentRequired: z.boolean(),
    content: z.string().trim().min(1, "내용을 입력해 주세요."),
    revisionReason: z
      .string()
      .trim()
      .min(1, "개정 사유를 입력해 주세요.")
      .max(100, "개정 사유는 100자 이하로 입력해 주세요."),
    deployStatus: z.enum(["R", "D"]),
    reservedAt: z.coerce.date().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.deployStatus === "R" && !value.reservedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reservedAt"],
        message: "예약 게시 일시를 선택해 주세요.",
      });
    }
  });

export type TermValuesSchema = z.infer<typeof termValueSchema>;
