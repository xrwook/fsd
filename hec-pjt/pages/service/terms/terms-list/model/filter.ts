import type { DropdownOption } from "@hae-fe/elements";

export type TermRequiredFilterValue = "" | boolean;

export type TermsListFilterState = {
  revisionReason: string;
  isRequired: TermRequiredFilterValue;
  deployDate: string;
  page: number;
  size: number;
};

export const termsFilterState: TermsListFilterState = {
  revisionReason: "",
  isRequired: "",
  deployDate: "",
  page: 0,
  size: 15,
};

export const AllItem = {
  label: "전체",
  value: "",
};

export const REQUIRED_FILTER_ITEMS = [
  AllItem,
  { label: "필수", value: true },
  { label: "선택", value: false },
];

export const PER_PAGE_OPTIONS: DropdownOption[] = [
  { label: "15개씩 보기", value: "15" },
  { label: "25개씩 보기", value: "25" },
  { label: "50개씩 보기", value: "50" },
  { label: "100개씩 보기", value: "100" },
];
