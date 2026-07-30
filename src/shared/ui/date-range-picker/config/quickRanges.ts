export type DateQuickRange = {
  amount: number;
  label: string;
  unit: "days" | "months";
};

export type AllQuickRange = {
  label: string;
  type: "all";
};

export type QuickRange = AllQuickRange | DateQuickRange;

export const isAllQuickRange = (
  quickRange: QuickRange,
): quickRange is AllQuickRange =>
  "type" in quickRange && quickRange.type === "all";

export const QUICK_RANGES: DateQuickRange[] = [
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
