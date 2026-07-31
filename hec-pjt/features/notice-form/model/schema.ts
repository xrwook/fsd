import { z } from 'zod';

export const noticeValueSchema = z
  .object({
    noticeTypeCd: z.string().min(1),
    isImportant: z.boolean(),
    title: z
      .string()
      .trim()
      .min(1, '제목을 입력해주세요.')
      .max(100, '제목은 100자 이하로 입력해주세요.'),
    content: z.string().trim().min(1, '내용을 입력해주세요.'),
    publishType: z.string().min(1),
    publishedAt: z.coerce.date().nullable(),
    attachFileId: z.string(),
    fileConfirm: z.object({
      groups: z.array(
        z.object({
          fileId: z.string(),
          referenceType: z.string(),
          fileDtlIds: z.array(z.number()),
        }),
      ),
    }),
    version: z.number().optional(),
    // .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.publishType === 'SCHEDULED' && !value.publishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message: '게시일을 선택하세요',
      });
    }
  });

export type NoticeValuesSchema = z.infer<typeof noticeValueSchema>;
