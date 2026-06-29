import { z } from "zod";

export const stationUpdateFormSchema = z.object({
  stationName: z.string().min(1, "충전소명을 입력해 주세요."),
  managerEmail: z.string().email("올바른 이메일을 입력해 주세요."),
  chargerCount: z
    .number()
    .int("충전기 수는 정수로 입력해 주세요.")
    .min(1, "충전기 수는 1대 이상이어야 합니다."),
});

export type TStationUpdateFormValues = z.infer<typeof stationUpdateFormSchema>;
