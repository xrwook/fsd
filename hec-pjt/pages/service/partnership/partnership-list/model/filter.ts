import type { DropdownOption, FilterSelectItem } from "@hae-fe/elements";
import type { DateRangeQuickRange } from "@/shared/ui/date-range-picker";

import type { PartnershipProcessStatusCd } from "./partnershipList";

export type PartnershipListFilterState = {
  searchWord?: string;
  requestStartAt?: string;
  requestEndAt?: string;
  confirmStartAt?: string;
  confirmEndAt?: string;
  processStatusCd?: "" | PartnershipProcessStatusCd;
  page: number;
  size: number;
};

export const partnershipFilterState: PartnershipListFilterState = {
  searchWord: "",
  requestStartAt: "",
  requestEndAt: "",
  confirmStartAt: "",
  confirmEndAt: "",
  processStatusCd: "",
  page: 0,
  size: 15,
};

export const PARTNERSHIP_STATUS_ITEMS: FilterSelectItem[] = [
  { label: "전체", value: "" },
  { label: "대기", value: "PENDING" },
  { label: "확인 완료", value: "CONFIRMED" },
];

export const QUICK_RANGE_OPTIONS: DateRangeQuickRange[] = [
  { label: "전체", type: "all" },
  { amount: 7, label: "1주", unit: "days" },
  { amount: 1, label: "1개월", unit: "months" },
  { amount: 3, label: "3개월", unit: "months" },
  { amount: 6, label: "6개월", unit: "months" },
  { amount: 12, label: "1년", unit: "months" },
];

export const PER_PAGE_OPTIONS: DropdownOption[] = [
  { label: "15개씩 보기", value: "15" },
  { label: "25개씩 보기", value: "25" },
  { label: "50개씩 보기", value: "50" },
  { label: "100개씩 보기", value: "100" },
];
