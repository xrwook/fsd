import { z } from "zod";

export const faqValueSchema = z
  .object({
    faqCategoryId: z.string().min(1),
    question: z.string().trim().min(1, "질문을 입력해주세요."),
    answer: z.string().trim().min(1, "답변을 입력해주세요."),
    publishType: z.string().min(1),
    scheduledAt: z.coerce.date().nullable(),
    isTop10: z.boolean(),
    version: z.number().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.publishType === "SCHEDULED" && !value.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "예약일시를 선택하세요",
      });
    }
  });

export type FaqValuesSchema = z.infer<typeof faqValueSchema>;
