import { addDays, addMonths } from "../lib/date";

export type QuickRange = {
  label: string;
  startDate: (endDate: Date) => Date;
};

export const QUICK_RANGES: QuickRange[] = [
  {
    label: "1주",
    startDate: (endDate) => addDays(endDate, -7),
  },
  {
    label: "1개월",
    startDate: (endDate) => addMonths(endDate, -1),
  },
  {
    label: "3개월",
    startDate: (endDate) => addMonths(endDate, -3),
  },
  {
    label: "6개월",
    startDate: (endDate) => addMonths(endDate, -6),
  },
  {
    label: "1년",
    startDate: (endDate) => addMonths(endDate, -12),
  },
];
