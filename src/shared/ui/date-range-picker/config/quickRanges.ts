export type QuickRange = {
  amount: number;
  label: string;
  unit: "days" | "months";
};

export const QUICK_RANGES: QuickRange[] = [
  {
    amount: 7,
    label: "1주",
    unit: "days",
  },
  {
    amount: 1,
    label: "1개월",
    unit: "months",
  },
  {
    amount: 3,
    label: "3개월",
    unit: "months",
  },
  {
    amount: 6,
    label: "6개월",
    unit: "months",
  },
  {
    amount: 12,
    label: "1년",
    unit: "months",
  },
];
